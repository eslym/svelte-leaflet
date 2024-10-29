<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseProps } from './types.js';
	import { initContext, kGroup, kLayer, kMarker, resolveContext } from './context.js';
	import { BROWSER } from 'esm-env';
	import {
		coordsEqual,
		destroy,
		extractOptions,
		importLeaflet,
		latlngExp,
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
						const current = latlngExp(marker.getLatLng());
						if (!coordsEqual(current, latlng)) {
							latlng = current;
						}
					}
				});
				marker.setLatLng(latlng);
				instance = marker;
				oninit?.call(marker, marker, L);
				parentReady?.((p) => marker.addTo(p));
				resolveMarker(marker);

				watch = () => {
					syncHandler(marker!.dragging, draggable);
					const prev = marker.getLatLng();
					if (!coordsEqual(latlngExp(prev), latlng)) {
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
