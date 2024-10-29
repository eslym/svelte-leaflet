<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { destroy, extractOptions, importLeaflet, noop, setOptions, setupEvent } from './utils.js';
	import { onMount } from 'svelte';
	import { initContext, kGroup, kLayer, resolveContext } from './context.js';
	import type { BaseProps } from './types.js';

	interface $$Props extends BaseProps<L.TileLayer.WMS>, L.WMSOptions {
		url: string;
	}

	const onParent = resolveContext(kGroup, false);
	const resolveLayer = initContext<L.TileLayer.WMS>(kLayer);

	let {
		url = $bindable(),
		instance = $bindable(undefined as any),
		opacity = undefined,
		zIndex = undefined,
		oninit = undefined,
		...restProps
	}: $$Props = $props();

	let watch = noop;

	$effect(() => watch(url, restProps));

	if (BROWSER) {
		onMount(() => {
			let layer: L.TileLayer.WMS = undefined as any;
			importLeaflet((L) => {
				layer = new L.TileLayer.WMS(url, {
					...extractOptions(restProps),
					opacity,
					zIndex
				});
				setupEvent(L, layer, () => restProps);
				instance = layer;
				oninit?.call(layer, layer, L);
				resolveLayer(layer);
				onParent?.((p) => layer!.addTo(p));

				watch = () => {
					if (url !== (layer as any)._url) {
						layer.setUrl(url);
					}
					layer.setUrl(url);
					layer.setOpacity(
						opacity === undefined ? L.TileLayer.WMS.prototype.options.opacity! : opacity
					);
					layer.setZIndex(
						zIndex === undefined ? L.TileLayer.WMS.prototype.options.zIndex! : zIndex
					);
					setOptions(layer, L.TileLayer.WMS, {
						...extractOptions(restProps),
						opacity,
						zIndex
					});
				};
			});
			return () => destroy(layer);
		});
	}
</script>
