<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseProps } from './types.js';
	import { initContext, kGroup, kLayer, kMarker, resolveContext } from './context.js';
	import { BROWSER } from 'esm-env';
	import {
	destroy,
		extractOptions,
		importLeaflet,
		noop,
		setOptions,
		setupEvent,
		syncHandler
	} from './utils.js';

	interface $$Props extends BaseProps<L.Marker>, Omit<L.MarkerOptions, 'icon'> {
		latlng: [number, number];
	}

	let {
		children = undefined,
		latlng = $bindable([0, 0]),
		instance = $bindable(undefined as any),
		draggable = $bindable(false),
		opacity = undefined,
		oninit = undefined,
		...restProps
	}: $$Props = $props();

	const resolveMarker = initContext<L.Marker>(kMarker, kLayer);
	const parentReady = resolveContext(kGroup, false);
	let watch = noop;

	$effect(() => watch(latlng, draggable, opacity, restProps));

	if (BROWSER) {
		onMount(() => {
			let marker: L.Marker = undefined as any;
			importLeaflet((L) => {
				marker = new L.Marker(latlng, {
					...extractOptions(restProps),
					draggable
				});
				setupEvent(L, marker, () => restProps, {
					move() {
						const current = marker.getLatLng();
						latlng = [current.lat, current.lng];
					}
				});
				marker.setLatLng(latlng);
				oninit?.(marker, L);
				parentReady?.((p) => marker.addTo(p));
				resolveMarker(marker);
				instance = marker;

				watch = () => {
					syncHandler(marker!.dragging, draggable);
					const prev = marker.getLatLng();
					if (prev.lat !== latlng[0] || prev.lng !== latlng[1]) {
						marker.setLatLng(latlng);
					}
					marker.setOpacity(opacity === undefined ? L.Marker.prototype.options.opacity! : opacity);
					setOptions(marker, L.Marker, { ...restProps, draggable });
				};
			});
			return () => destroy(marker);
		});
	}
</script>

{#if BROWSER}
	{@render children?.(instance)}
{/if}
