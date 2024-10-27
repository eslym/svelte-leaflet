<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { onMount } from 'svelte';
	import { kMap, resolveContext } from './context.js';
	import { importLeaflet, noop } from './utils.js';
	import type { BaseProps } from './types.js';

	interface $$Props extends BaseProps<L.Control>, L.ControlOptions {}

	let {
		children,
		instance = $bindable(undefined as any),
		position = $bindable('topright'),
		oninit
	}: $$Props = $props();
	let div: HTMLDivElement = $state(undefined as any);
	let watch = noop;

	const onMap = resolveContext(kMap, false);

	$effect(() => watch(position));

	if (BROWSER) {
		onMount(() => {
			div.remove();
			let control: L.Control = undefined as any;
			importLeaflet((L) => {
				control = new L.Control({ position });
				control.onAdd = () => div;
				oninit?.(control, L);
				onMap?.((map) => control?.addTo(map));
				instance = control;

				watch = () => {
					control.setPosition(position);
				};
			});
			return () => control?.remove();
		});
	}
</script>

{#if BROWSER}
	<div bind:this={div}>
		{@render children?.(instance)}
	</div>
{/if}

<style>
	div {
		display: contents;
	}
</style>
