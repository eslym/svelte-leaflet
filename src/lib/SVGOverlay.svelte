<script lang="ts">
	import type { BaseProps } from '$lib/types.js';
	import { boundsExp, coordsEqual, destroy, noop, setupEvent } from '$lib/utils.js';
	import { BROWSER } from 'esm-env';
	import { onMount } from 'svelte';
	import { kGroup, resolveContext } from './context.js';

	interface $$Props extends BaseProps<L.SVGOverlay>, Omit<L.ImageOverlayOptions, 'alt'> {
		viewbox: string;
		bounds: [[number, number], [number, number]];
	}

	let {
		children = undefined,
		viewbox,
		bounds,
		instance = $bindable(undefined as any),
		oninit = undefined,
		zIndex = undefined,
		...restProps
	}: $$Props = $props();

	let watch = noop;
	let svg: SVGElement = $state(undefined as any);

	const parentReady = resolveContext(kGroup, false);

	$effect(() => watch(bounds, zIndex, restProps));

	if (BROWSER) {
		onMount(() => {
			svg.remove();
			let overlay: L.SVGOverlay = undefined as any;
			import('leaflet').then(({ default: L }) => {
				overlay = new L.SVGOverlay(svg, bounds, {
					zIndex,
					...restProps
				});
				setupEvent(L, overlay, () => restProps);
				instance = overlay;
				oninit?.call(overlay, overlay, L);
				parentReady?.((p) => overlay.addTo(p));

				watch = () => {
					const b = overlay.getBounds();
					if (!coordsEqual(boundsExp(b), bounds)) {
						const newBounds = new L.LatLngBounds(bounds);
						overlay.setBounds(newBounds);
					}
					overlay.setZIndex(zIndex ?? 1);
				};
			});
			return () => destroy(overlay);
		});
	}
</script>

{#if BROWSER}
	<svg bind:this={svg} xmlns="http://www.w3.org/2000/svg" viewBox={viewbox}>
		{@render children?.(instance)}
	</svg>
{/if}
