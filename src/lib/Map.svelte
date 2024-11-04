<script lang="ts">
	import { onMount } from 'svelte';
	import {
		importLeaflet,
		setupEvent,
		extractOptions,
		syncHandler,
		setOptions,
		noop,
		latlngExp,
		coordsEqual,
		useCleanup
	} from './utils.js';
	import { BROWSER } from 'esm-env';
	import { initContext, kGroup, kMap } from './context.js';
	import type { BaseProps } from './types.js';

	interface $$Props
		extends Omit<BaseProps<L.Map, never>, 'onparentresolved'>,
			Omit<L.MapOptions, 'center' | 'zoom'> {
		center?: [number, number] | undefined;
		zoom?: number | undefined;
	}

	const resolveMap = initContext<L.Map>(kMap, kGroup);
	const { onCleanup, cleanup } = useCleanup();

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
		oninit = undefined,
		...restProps
	}: $$Props = $props();

	let watch = noop;

	$effect(() => watch(center, zoom, dragging, doubleClickZoom, touchZoom, scrollWheelZoom));

	if (BROWSER) {
		onMount(() => {
			importLeaflet(async (L) => {
				const map = new L.Map(div, {
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
						const current = latlngExp(map.getCenter());
						if (!coordsEqual(current, center)) {
							center = current;
						}
					},
					zoomend() {
						if (zoom !== map.getZoom()) {
							zoom = map.getZoom();
						}
					}
				});
				instance = map;
				onCleanup(map.remove.bind(map));
				onCleanup(oninit?.call(map, map, L));
				resolveMap(map);

				watch = () => {
					syncHandler(map.dragging, dragging);
					syncHandler(map.doubleClickZoom, doubleClickZoom);
					syncHandler(map.touchZoom, touchZoom);
					syncHandler(map.scrollWheelZoom, scrollWheelZoom);
					const current = latlngExp(map.getCenter());
					if (!coordsEqual(current, center) || map.getZoom() !== zoom) {
						map.setView(center, zoom);
					}
					setOptions(map!, L.Map.prototype.options, {
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
			return cleanup;
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
