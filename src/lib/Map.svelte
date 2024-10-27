<script lang="ts">
	import { onMount } from 'svelte';
	import {
		importLeaflet,
		setupEvent,
		extractOptions,
		syncHandler,
		setOptions,
		noop,

		destroy

	} from './utils.js';
	import { BROWSER } from 'esm-env';
	import { initContext, kGroup, kMap } from './context.js';
	import type { BaseProps } from './types.js';

	interface $$Props extends BaseProps<L.Map>, Omit<L.MapOptions, 'center' | 'zoom'> {
		center?: [number, number] | undefined;
		zoom?: number | undefined;
	}

	const resolveMap = initContext<L.Map>(kMap, kGroup);

	let div: HTMLDivElement = undefined as any;
	let {
		children = undefined,
		instance = $bindable(undefined as any),
		center = $bindable([0, 0]),
		zoom = $bindable(0),
		dragging = $bindable(true),
		doubleClickZoom = $bindable(true),
		touchZoom = $bindable(true),
		scrollWheelZoom = $bindable(true),
		oninit,
		...restProps
	}: $$Props = $props();

	let watch = noop;

	$effect(() => watch(center, zoom, dragging, doubleClickZoom, touchZoom, scrollWheelZoom));

	if (BROWSER) {
		onMount(() => {
			let map: L.Map = undefined as any;
			importLeaflet(async (L) => {
				map = new L.Map(div, {
					...extractOptions(restProps),
					center,
					zoom,
					dragging,
					doubleClickZoom,
					touchZoom,
					scrollWheelZoom
				});
				setupEvent(L, map, () => restProps, {
					move() {
						const { lat, lng } = map!.getCenter();
						if (lat !== center[0] || lng !== center[1]) {
							center = [lat, lng];
						}
					},
					zoomend() {
						zoom = map!.getZoom();
					}
				});
				oninit?.(map, L);
				resolveMap(map);
				instance = map;

				watch = () => {
					syncHandler(map.dragging, dragging);
					syncHandler(map.doubleClickZoom, doubleClickZoom);
					syncHandler(map.touchZoom, touchZoom);
					syncHandler(map.scrollWheelZoom, scrollWheelZoom);
					const { lat, lng } = map.getCenter();
					if (lat !== center[0] || lng !== center[1] || map.getZoom() !== zoom) {
						map.setView(center, zoom);
					}
					setOptions(map!, L.Map, {
						...extractOptions(restProps),
						center,
						zoom,
						dragging,
						doubleClickZoom,
						touchZoom,
						scrollWheelZoom
					});
				};
			});
			return () => destroy(map);
		});
	}
</script>

<div bind:this={div}>
	{#if BROWSER}
		{@render children?.(instance)}
	{/if}
</div>

<style>
	div {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
