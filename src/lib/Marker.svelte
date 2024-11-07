<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseProps } from './types.js';
	import { initContext, kGroup, kLayer, kMarker, resolveContext } from './context.js';
	import { BROWSER } from 'esm-env';
	import {
		coordsEqual,
		extractOptions,
		importLeaflet,
		latlngExp,
		noop,
		setOptions,
		setupEvent,
		syncHandler,
		useCleanup
	} from './utils.js';

	interface $$Props
		extends BaseProps<L.Marker, L.LayerGroup | L.Map>,
			Omit<L.MarkerOptions, 'icon'> {
		latlng: [number, number];
	}

	let {
		children = undefined,
		latlng = $bindable([0, 0]),
		instance = $bindable(undefined as any),
		draggable = $bindable(false),
		opacity = undefined,
		oninit = undefined,
		onparentresolved = undefined,
		...restProps
	}: $$Props = $props();

	const { onCleanup, cleanup } = useCleanup();
	const resolveMarker = initContext<L.Marker>(kMarker, kLayer);
	const parentReady = resolveContext(kGroup, false);
	let watch = noop;

	$effect(() => watch(latlng, draggable, opacity, restProps));

	if (BROWSER) {
		onMount(() => {
			importLeaflet((L) => {
				let icon: any = undefined;
				const baseOpt = Object.setPrototypeOf(
					{
						get draggable() {
							return draggable;
						},
						set draggable(value: boolean) {
							draggable = value;
						},
						get icon() {
							return icon ?? L.Marker.prototype.options.icon;
						},
						set icon(value: any) {
							icon = value;
						}
					},
					L.Marker.prototype.options
				);
				const marker = new L.Marker(latlng, {
					...extractOptions(restProps),
					draggable
				});
				setOptions(marker, baseOpt, {
					...restProps
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
				onCleanup(marker.remove.bind(marker));
				onCleanup(oninit?.call(marker, marker, L));
				parentReady?.((p) => {
					marker.addTo(p);
					onCleanup(onparentresolved?.call(marker, p, L));
				});
				resolveMarker(marker);

				watch = () => {
					syncHandler(marker!.dragging, draggable);
					const prev = marker.getLatLng();
					if (!coordsEqual(latlngExp(prev), latlng)) {
						marker.setLatLng(latlng);
					}
					marker.setOpacity(opacity === undefined ? L.Marker.prototype.options.opacity! : opacity);
					setOptions(marker, baseOpt, {
						...restProps
					});
				};
			});
			return cleanup;
		});
	}
</script>

{#if BROWSER}
	{@render children?.(instance)}
{/if}
