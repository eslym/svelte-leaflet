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
			Omit<L.MapOptions, 'center' | 'zoom' | 'crs'> {
		class?: string;
		center?: [number, number] | undefined;
		zoom?: number | undefined;
		crs?: L.CRS | keyof typeof import('leaflet').CRS | undefined;
	}

	const resolveMap = initContext<L.Map>(kMap, kGroup);
	const onCleanup = useCleanup();

	let div: HTMLDivElement = undefined as any;
	let {
		children = undefined,
		class: classNames = undefined,
		crs = undefined,
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

	$effect(() => watch(center, crs, zoom, dragging, doubleClickZoom, touchZoom, scrollWheelZoom));

	if (BROWSER) {
		onMount(() => {
			importLeaflet(async (L) => {
				const baseOpts = Object.setPrototypeOf(
					{
						get crs() {
							return typeof crs === 'string' ? L.CRS[crs] : (crs ?? L.Map.prototype.options.crs);
						},
						set crs(value) {
							crs = value;
						}
					},
					L.Map.prototype.options
				);
				const map = new L.Map(div, {
					...extractOptions(restProps),
					crs: baseOpts.crs,
					center,
					zoom,
					dragging,
					doubleClickZoom,
					touchZoom,
					scrollWheelZoom
				});
				setOptions(map, baseOpts, {
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
					setOptions(map!, baseOpts, {
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
		});
	}
</script>

<div bind:this={div} class={classNames}>
	{#if BROWSER}
		{@render children?.(instance)}
	{/if}
</div>
