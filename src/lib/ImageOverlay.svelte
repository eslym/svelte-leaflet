<script lang="ts">
	import type { BaseProps } from '$lib/types.js';
	import { boundsExp, coordsEqual, destroy, noop, setupEvent } from '$lib/utils.js';
	import { BROWSER } from 'esm-env';
	import { onMount } from 'svelte';
	import { kGroup, resolveContext } from './context.js';

	interface $$Props extends BaseProps<L.ImageOverlay>, L.ImageOverlayOptions {
		url: string;
		bounds: [[number, number], [number, number]];
	}

	let {
		children = undefined,
		url,
		bounds,
		instance = $bindable(undefined as any),
		oninit = undefined,
		zIndex = undefined,
		...restProps
	}: $$Props = $props();

	const parentReady = resolveContext(kGroup, false);
	let watch = noop;

	$effect(() => watch(url, bounds, zIndex, restProps));

	if (BROWSER) {
		onMount(() => {
			let overlay: L.ImageOverlay = undefined as any;
			import('leaflet').then(({ default: L }) => {
				overlay = new L.ImageOverlay(url, bounds, {
					zIndex,
					...restProps
				});
				setupEvent(L, overlay, () => restProps);
				instance = overlay;
				oninit?.call(overlay, overlay, L);
				parentReady?.((p) => overlay.addTo(p));

				watch = () => {
					if ((overlay as any)._url !== url) {
						overlay.setUrl(url);
					}
					const b = overlay.getBounds();
					if (!coordsEqual(boundsExp(b), bounds)) {
						const newBounds = new L.LatLngBounds(bounds);
						overlay.setBounds(newBounds);
					}
					overlay.setZIndex(zIndex ?? 1);
					overlay.setZIndex(zIndex ?? 1);
				};
			});
			return () => destroy(overlay);
		});
	}
</script>
