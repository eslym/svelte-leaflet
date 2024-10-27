<script lang="ts">
	import type { BaseProps } from '$lib/types.js';
	import { destroy, noop, setupEvent } from '$lib/utils.js';
	import { BROWSER } from 'esm-env';
	import { onMount } from 'svelte';

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
				oninit?.(overlay, L);
				instance = overlay;

				watch = () => {
					if ((overlay as any)._url !== url) {
						overlay.setUrl(url);
					}
					const b = overlay.getBounds();
					const sw = b.getSouthWest();
					const ne = b.getNorthEast();
					if (
						sw.lat !== bounds[0][0] ||
						sw.lng !== bounds[0][1] ||
						ne.lat !== bounds[1][0] ||
						ne.lng !== bounds[1][1]
					) {
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
