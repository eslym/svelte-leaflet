<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { onMount } from 'svelte';
	import { kMap, resolveContext } from './context.js';
	import { importLeaflet, noop, useCleanup } from './utils.js';
	import type { BaseProps } from './types.js';

	interface $$Props extends BaseProps<L.Control, L.Map>, L.ControlOptions {}

	let {
		children,
		instance = $bindable(undefined as any),
		position = $bindable('topright'),
		oninit,
		onparentresolved
	}: $$Props = $props();
	let div: HTMLDivElement = $state(undefined as any);
	let watch = noop;

	const onMap = resolveContext(kMap, false);

	const onCleanup = useCleanup();

	$effect(() => watch(position));

	if (BROWSER) {
		onMount(() => {
			div.remove();
			importLeaflet((L) => {
				const control = new L.Control({ position });
				control.onAdd = () => div;
				instance = control;
				onCleanup(control.remove.bind(control));
				onCleanup(oninit?.call(control, control, L));
				onMap?.((map) => {
					control.addTo(map);
					onCleanup(onparentresolved?.call(control, map, L));
				});

				watch = () => {
					control.setPosition(position);
				};
			});
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
