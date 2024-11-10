<script lang="ts">
	import type { BaseProps } from '$lib/types.js';
	import { boundsExp, coordsEqual, noop, setupEvent, useCleanup } from '$lib/utils.js';
	import { BROWSER } from 'esm-env';
	import { onMount } from 'svelte';
	import { kGroup, resolveContext } from './context.js';

	interface $$Props
		extends BaseProps<L.SVGOverlay, L.Map | L.LayerGroup>,
			Omit<L.ImageOverlayOptions, 'alt'> {
		viewbox: string;
		bounds: [[number, number], [number, number]];
	}

	let {
		children = undefined,
		viewbox,
		bounds,
		instance = $bindable(undefined as any),
		oninit = undefined,
		onparentresolved = undefined,
		zIndex = undefined,
		...restProps
	}: $$Props = $props();

	let watch = noop;
	let svg: SVGElement = $state(undefined as any);

	const onCleanup = useCleanup();
	const parentReady = resolveContext(kGroup, false);

	$effect(() => watch(bounds, zIndex, restProps));

	if (BROWSER) {
		onMount(() => {
			svg.remove();
			import('leaflet').then(({ default: L }) => {
				const overlay = new L.SVGOverlay(svg, bounds, {
					zIndex,
					...restProps
				});
				setupEvent(L, overlay, () => restProps);
				instance = overlay;
				onCleanup(overlay.remove.bind(overlay));
				onCleanup(oninit?.call(overlay, overlay, L));
				parentReady?.((p) => {
					overlay.addTo(p);
					onCleanup(onparentresolved?.call(overlay, p, L));
				});

				watch = () => {
					const b = overlay.getBounds();
					if (!coordsEqual(boundsExp(b), bounds)) {
						const newBounds = new L.LatLngBounds(bounds);
						overlay.setBounds(newBounds);
					}
					overlay.setZIndex(zIndex ?? 1);
				};
			});
		});
	}
</script>

{#if BROWSER}
	<svg bind:this={svg} xmlns="http://www.w3.org/2000/svg" viewBox={viewbox}>
		{@render children?.(instance)}
	</svg>
{/if}
