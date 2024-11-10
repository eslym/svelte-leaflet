<script lang="ts">
	import type { BaseProps } from '$lib/types.js';
	import { boundsExp, coordsEqual, noop, setupEvent, useCleanup } from '$lib/utils.js';
	import { BROWSER } from 'esm-env';
	import { onMount } from 'svelte';
	import { kGroup, resolveContext } from './context.js';

	interface $$Props extends BaseProps<L.ImageOverlay, L.LayerGroup | L.Map>, L.ImageOverlayOptions {
		url: string;
		bounds: [[number, number], [number, number]];
	}

	let {
		children = undefined,
		url,
		bounds,
		instance = $bindable(undefined as any),
		oninit = undefined,
		onparentresolved = undefined,
		zIndex = undefined,
		...restProps
	}: $$Props = $props();

	const parentReady = resolveContext(kGroup, false);
	const onCleanup = useCleanup();
	let watch = noop;

	$effect(() => watch(url, bounds, zIndex, restProps));

	if (BROWSER) {
		onMount(() => {
			import('leaflet').then(({ default: L }) => {
				const overlay = new L.ImageOverlay(url, bounds, {
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
		});
	}
</script>
