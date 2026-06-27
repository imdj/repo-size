<script>
    import favicon from '$lib/assets/favicon.svg';
    import Logo from '$lib/components/Logo.svelte';
    import '$lib/app.css';
    import Icon from '@iconify/svelte';
    import { browser } from '$app/environment';

    let { children } = $props();

    // Initialize from the class already applied by the head script
    let dark = $state(true);

    if (browser) {
        dark = document.documentElement.classList.contains('dark');
    }

    $effect(() => {
        if (!browser) return;
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    });

    function toggleTheme() {
        dark = !dark;
    }
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <script>
        (function () {
            try {
                const stored = localStorage.getItem('theme');
                const supportDark = window.matchMedia(
                    '(prefers-color-scheme: dark)',
                ).matches;
                if (stored === 'dark' || (!stored && supportDark)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {}
        })();
    </script>
</svelte:head>

<header
    class="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a
            href="/"
            class="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity">
            <Logo class="size-8 text-indigo-500" />
            Repo Size
        </a>

        <button
            id="theme-toggle"
            onclick={toggleTheme}
            aria-label="Toggle dark mode"
            class="cursor-pointer p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {#if dark}
                <Icon icon="lucide:sun" width="20" height="20" />
            {:else}
                <Icon icon="lucide:moon" width="20" height="20" />
            {/if}
        </button>
    </div>
</header>

<div class="flex-1">
    {@render children()}
</div>
