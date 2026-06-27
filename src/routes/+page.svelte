<script>
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';

    let { form } = $props();
    let loading = $state(false);

    const platformMeta = {
        github: {
            name: 'GitHub',
            icon: 'simple-icons:github',
            colorDark: '#ffffff',
            colorLight: '#181717',
        },
        bitbucket: {
            name: 'Bitbucket',
            icon: 'simple-icons:bitbucket',
            colorDark: '#0052CC',
            colorLight: '#0052CC',
        },
        gitea: {
            name: 'Gitea',
            icon: 'simple-icons:gitea',
            colorDark: '#609926',
            colorLight: '#609926',
        },
    };

    const meta = $derived(form?.platform ? platformMeta[form.platform] : null);
</script>

<svelte:head>
    <title>Repo Size — Find the size of any Git repository</title>
    <meta
        name="description"
        content="Free tool to find the size of any GitHub, GitLab, Bitbucket, or Gitea repository without cloning it." />
</svelte:head>

<main
    class="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-16">
    <div class="max-w-2xl w-full text-center space-y-8">
        <div class="space-y-3">
            <h1
                class="text-4xl sm:text-5xl font-extrabold tracking-tight text-indigo-500">
                Repo Size
            </h1>
            <p
                class="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Find the size of any Git repository without cloning it.
                <span
                    class="block text-sm text-gray-400 dark:text-gray-500 mt-1"
                    >Supports GitHub, Bitbucket, and Gitea</span>
            </p>
        </div>

        <form
            method="POST"
            use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    await update();
                    loading = false;
                };
            }}
            class="flex flex-col sm:flex-row gap-3 w-full">
            <input
                id="repo-url-input"
                name="repoUrl"
                type="text"
                placeholder="https://github.com/owner/repo"
                value={form?.repoUrl ?? ''}
                class="flex-1 px-5 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 dark:bg-gray-800/70 dark:border-gray-700/60 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40 transition-all backdrop-blur-sm text-base shadow-sm"
                required
                disabled={loading} />
            <button
                id="submit-btn"
                type="submit"
                disabled={loading}
                class="px-7 py-3.5 rounded-xl font-semibold text-base bg-indigo-500 text-white hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                {#if loading}
                    <span
                        class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                    Checking…
                {:else}
                    Get Size
                {/if}
            </button>
        </form>

        {#if form && !loading}
            <div class="animate-[fadeSlideIn_0.35s_ease-out_both]">
                {#if form.success}
                    <div
                        class="bg-white/60 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8 space-y-5 shadow-xl dark:shadow-2xl shadow-gray-200/50 dark:shadow-black/20 transition-colors duration-300">
                        <div class="flex items-center justify-center gap-3">
                            {#if meta}
                                <span
                                    class="dark:hidden"
                                    style:color={meta.colorLight}
                                    ><Icon
                                        icon={meta.icon}
                                        width="28"
                                        height="28" /></span>
                                <span
                                    class="hidden dark:inline"
                                    style:color={meta.colorDark}
                                    ><Icon
                                        icon={meta.icon}
                                        width="28"
                                        height="28" /></span>
                                <span
                                    class="text-sm font-medium px-3 py-1 rounded-full bg-gray-200/70 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                                    {meta.name}
                                </span>
                            {/if}
                        </div>

                        <p
                            class="text-gray-500 dark:text-gray-400 text-base font-mono">
                            {form.owner}<span
                                class="text-gray-300 dark:text-gray-600">/</span
                            >{form.repo}
                        </p>

                        <div class="space-y-1">
                            <p
                                class="text-5xl sm:text-6xl font-extrabold tracking-tight text-emerald-600">
                                {form.sizeFormatted}
                            </p>
                            <p class="text-sm text-gray-400 dark:text-gray-500">
                                Repository size on disk
                            </p>
                        </div>
                    </div>
                {:else}
                    <div
                        class="bg-red-50/60 dark:bg-red-950/30 backdrop-blur-md border border-red-200 dark:border-red-800/40 rounded-2xl p-6 space-y-3 shadow-xl dark:shadow-2xl shadow-red-100/50 dark:shadow-black/20 transition-colors duration-300">
                        <div
                            class="flex items-center justify-center gap-2 text-red-500 dark:text-red-400">
                            <Icon
                                icon="lucide:alert-circle"
                                width="22"
                                height="22" />
                            <span class="font-semibold text-base">Error</span>
                        </div>
                        {#if meta}
                            <div class="flex items-center justify-center gap-2">
                                <span
                                    class="dark:hidden"
                                    style:color={meta.colorLight}
                                    ><Icon
                                        icon={meta.icon}
                                        width="18"
                                        height="18" /></span>
                                <span
                                    class="hidden dark:inline"
                                    style:color={meta.colorDark}
                                    ><Icon
                                        icon={meta.icon}
                                        width="18"
                                        height="18" /></span>
                                <span
                                    class="text-sm text-gray-500 dark:text-gray-400"
                                    >{meta.name}</span>
                            </div>
                        {/if}
                        <p
                            class="text-red-600/80 dark:text-red-300/80 text-sm leading-relaxed">
                            {form.error}
                        </p>
                    </div>
                {/if}
            </div>
        {/if}

        <div
            class="flex items-center justify-center gap-6 pt-8 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            {#each Object.entries(platformMeta) as [id, p]}
                <div
                    class="group relative flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title={p.name}>
                    <div
                        class="group-hover:opacity-100 transition-opacity duration-300">
                        <span class="dark:hidden" style:color={p.colorLight}>
                            <Icon icon={p.icon} width="24" height="24" />
                        </span>
                        <span
                            class="hidden dark:inline"
                            style:color={p.colorDark}>
                            <Icon icon={p.icon} width="24" height="24" />
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</main>

<style>
    @keyframes fadeSlideIn {
        from {
            opacity: 0;
            transform: translateY(12px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
