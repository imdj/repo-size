/**
 * Detects the git hosting platform from a repository URL and extracts owner/repo.
 * @param {string} rawUrl
 * @returns {{ platform: string, host: string, owner: string, repo: string }}
 */
export function detectPlatform(rawUrl) {
    let url;
    try {
        // Handle URLs without protocol
        if (!/^https?:\/\//i.test(rawUrl)) {
            rawUrl = 'https://' + rawUrl;
        }
        url = new URL(rawUrl);
    } catch {
        throw new Error('Invalid URL. Please enter a valid repository URL.');
    }

    const hostname = url.hostname.toLowerCase();
    // Strip leading slash and trailing .git, then split
    const pathParts = url.pathname
        .replace(/^\//, '')
        .replace(/\.git$/, '')
        .split('/')
        .filter(Boolean);

    if (pathParts.length < 2) {
        throw new Error(
            "This link doesn't point to a repository. A valid repo URL looks like: github.com/owner/repo",
        );
    }

    const owner = pathParts[0];
    const repo = pathParts[1];

    if (hostname === 'github.com' || hostname === 'www.github.com') {
        return { platform: 'github', host: hostname, owner, repo };
    }

    if (hostname === 'gitlab.com' || hostname === 'www.gitlab.com') {
        // GitLab supports nested groups — use full path for project ID
        const fullPath = pathParts.join('/');
        return { platform: 'gitlab', host: hostname, owner: fullPath, repo };
    }

    if (hostname === 'bitbucket.org' || hostname === 'www.bitbucket.org') {
        return { platform: 'bitbucket', host: hostname, owner, repo };
    }

    // Fallback: treat as Gitea instance
    return { platform: 'gitea', host: hostname, owner, repo };
}

/**
 * Fetches repository size from platform APIs.
 * @param {{ platform: string, host: string, owner: string, repo: string }} info
 * @returns {Promise<{ sizeBytes: number }>}
 */
export async function fetchRepoSize(info) {
    try {
        switch (info.platform) {
            case 'github':
                return await fetchGitHub(info);
            case 'gitlab':
                return await fetchGitLab(info);
            case 'bitbucket':
                return await fetchBitbucket(info);
            case 'gitea':
                return await fetchGitea(info);
            default:
                throw new Error(`Unsupported platform: ${info.platform}`);
        }
    } catch (/** @type {any} */ e) {
        // Network-level failures (DNS, timeout, connection refused)
        if (
            e?.cause?.code === 'ENOTFOUND' ||
            e?.cause?.code === 'ECONNREFUSED' ||
            e?.cause?.code === 'ETIMEDOUT' ||
            e.name === 'TypeError'
        ) {
            throw new Error(
                'Link is inaccessible. The host could not be reached — check the URL or try again later.',
            );
        }
        throw e;
    }
}

async function fetchGitHub({ owner, repo }) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'repo-size-app',
        },
    });
    if (!res.ok) {
        if (res.status === 404)
            throw new Error(
                'Repository not found on GitHub. Make sure the URL points to an existing repo.',
            );
        if (res.status === 403)
            throw new Error(
                'Link is inaccessible. The repository may be private or the API rate limit has been reached.',
            );
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // GitHub returns size in KB
    return { sizeBytes: data.size * 1024 };
}

async function fetchGitLab({ owner }) {
    // owner is the full path for GitLab (encoded)
    const encodedPath = encodeURIComponent(owner);
    const res = await fetch(
        `https://gitlab.com/api/v4/projects/${encodedPath}?statistics=true`,
    );
    if (!res.ok) {
        if (res.status === 404)
            throw new Error(
                'Repository not found on GitLab. Make sure the URL points to an existing repo.',
            );
        if (res.status === 403)
            throw new Error(
                'Link is inaccessible. The repository may be private.',
            );
        throw new Error(`GitLab API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.statistics || data.statistics.repository_size === undefined) {
        throw new Error(
            'GitLab requires authentication to access repository size statistics. This is a GitLab API limitation for unauthenticated requests.',
        );
    }
    // GitLab returns size in bytes
    return { sizeBytes: data.statistics.repository_size };
}

async function fetchBitbucket({ owner, repo }) {
    const res = await fetch(
        `https://api.bitbucket.org/2.0/repositories/${owner}/${repo}`,
    );
    if (!res.ok) {
        if (res.status === 404)
            throw new Error(
                'Repository not found on Bitbucket. Make sure the URL points to an existing repo.',
            );
        if (res.status === 403)
            throw new Error(
                'Link is inaccessible. The repository may be private.',
            );
        throw new Error(`Bitbucket API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // Bitbucket returns size in bytes
    return { sizeBytes: data.size };
}

async function fetchGitea({ host, owner, repo }) {
    const res = await fetch(`https://${host}/api/v1/repos/${owner}/${repo}`);
    if (!res.ok) {
        if (res.status === 404)
            throw new Error(
                'Repository not found. The URL may not point to a valid repository or Gitea instance.',
            );
        if (res.status === 403)
            throw new Error(
                'Link is inaccessible. The repository may be private.',
            );
        throw new Error(
            `Gitea API error (${host}): ${res.status} ${res.statusText}`,
        );
    }
    const data = await res.json();
    // Gitea returns size in KB
    return { sizeBytes: data.size * 1024 };
}

/**
 * Formats a byte count into a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    // Show decimals only for MB and above
    const decimals = i >= 2 ? 2 : i === 1 ? 1 : 0;
    return `${value.toFixed(decimals)} ${units[i]}`;
}
