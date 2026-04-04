<script lang="ts">
	import { onMount } from "svelte";
	import Toggle from "@/components/Toggle.svelte";
	import {
		blockCountStorage,
		enabledStorage,
		resetBlockCount,
	} from "@/utils/storage";

	let enabled = $state(true);
	let blockCount = $state(0);
	let showResetConfirm = $state(false);

	onMount(async () => {
		enabled = await enabledStorage.getValue();
		blockCount = await blockCountStorage.getValue();

		enabledStorage.watch((newValue) => {
			enabled = newValue;
		});

		blockCountStorage.watch((newValue) => {
			blockCount = newValue;
		});
	});

	async function toggleEnabled() {
		enabled = !enabled;
		await enabledStorage.setValue(enabled);
	}

	async function handleReset() {
		if (!showResetConfirm) {
			showResetConfirm = true;
			return;
		}
		await resetBlockCount();
		blockCount = 0;
		showResetConfirm = false;
	}

	function cancelReset() {
		showResetConfirm = false;
	}
</script>

<main class="p-4">
	<header class="mb-4 flex items-center gap-3">
		<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600">
			<svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
			</svg>
		</div>
		<div>
			<h1 class="text-base font-bold leading-tight">No YouTube Shorts</h1>
			<p class="text-xs text-[var(--color-text-muted)]">Shorts Blocker</p>
		</div>
	</header>

	<section class="mb-3 flex items-center justify-between rounded-lg bg-[var(--color-surface)] p-3">
		<div>
			<p class="text-sm font-medium">
				{#if enabled}
					Protection Active
				{:else}
					Protection Off
				{/if}
			</p>
			<p class="text-xs text-[var(--color-text-muted)]">
				{#if enabled}
					Shorts will be blocked
				{:else}
					Shorts are allowed
				{/if}
			</p>
		</div>
		<Toggle checked={enabled} onToggle={toggleEnabled} />
	</section>

	<section class="mb-3 rounded-lg bg-[var(--color-surface)] p-3">
		<div class="flex items-center justify-between">
			<p class="text-xs text-[var(--color-text-muted)]">Blocked count</p>
			{#if blockCount > 0}
				{#if showResetConfirm}
					<div class="flex gap-1">
						<button
							class="rounded px-2 py-0.5 text-xs text-red-400 hover:bg-red-400/10"
							onclick={handleReset}
						>
							Reset?
						</button>
						<button
							class="rounded px-2 py-0.5 text-xs text-[var(--color-text-muted)] hover:bg-white/5"
							onclick={cancelReset}
						>
							Cancel
						</button>
					</div>
				{:else}
					<button
						class="rounded px-2 py-0.5 text-xs text-[var(--color-text-muted)] hover:bg-white/5"
						onclick={handleReset}
					>
						Reset
					</button>
				{/if}
			{/if}
		</div>
		<p class="mt-1 text-2xl font-bold tabular-nums">
			{blockCount.toLocaleString()}
		</p>
	</section>

	<footer class="text-center text-[10px] text-[var(--color-text-muted)]">
		v1.0.0 &middot; Chrome &middot; Firefox &middot; Edge
	</footer>
</main>
