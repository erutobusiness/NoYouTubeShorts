<script lang="ts">
	interface Props {
		checked: boolean;
		onToggle: () => void;
	}

	let { checked, onToggle }: Props = $props();
</script>

<button
	class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
	class:bg-green-500={checked}
	class:bg-neutral-600={!checked}
	role="switch"
	aria-checked={checked}
	aria-label="Toggle protection"
	onclick={onToggle}
>
	<span
		class="pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
		class:translate-x-5={checked}
		class:translate-x-0.5={!checked}
	></span>
</button>
