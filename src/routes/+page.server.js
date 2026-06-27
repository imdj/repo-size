import { fail } from '@sveltejs/kit';
import { detectPlatform, fetchRepoSize, formatBytes } from '$lib/platforms.js';

/** @satisfies {import('./$types').Actions} */
export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const repoUrl = formData.get('repoUrl')?.toString().trim();

        if (!repoUrl) {
            return fail(400, {
                error: 'Please enter a repository URL.',
                repoUrl,
            });
        }

        let info;
        try {
            info = detectPlatform(repoUrl);
        } catch (/** @type {any} */ e) {
            return fail(400, { error: e.message, repoUrl });
        }

        try {
            const { sizeBytes } = await fetchRepoSize(info);
            return {
                success: true,
                repoUrl,
                platform: info.platform,
                owner: info.owner,
                repo: info.repo,
                sizeBytes,
                sizeFormatted: formatBytes(sizeBytes),
            };
        } catch (/** @type {any} */ e) {
            return fail(502, {
                error: e.message,
                repoUrl,
                platform: info.platform,
                owner: info.owner,
                repo: info.repo,
            });
        }
    },
};
