<script lang="ts">
	import { BROWSER } from 'esm-env';
	import {
		extractOptions,
		importLeaflet,
		noop,
		setOptions,
		setupEvent,
		useCleanup
	} from './utils.js';
	import { onMount } from 'svelte';
	import { initContext, kGroup, kLayer, resolveContext } from './context.js';
	import type { BaseProps } from './types.js';

	interface $$Props extends BaseProps<L.TileLayer>, L.TileLayerOptions {
		url: string;
	}

	const { onCleanup, cleanup } = useCleanup();
	const onParent = resolveContext(kGroup, false);
	const resolveLayer = initContext<L.TileLayer>(kLayer);

	let {
		url = $bindable(),
		instance = $bindable(undefined as any),
		opacity = undefined,
		zIndex = undefined,
		oninit = undefined,
		onparentresolved = undefined,
		...restProps
	}: $$Props = $props();

	let watch = noop;

	$effect(() => watch(url, restProps));

	if (BROWSER) {
		onMount(() => {
			importLeaflet((L) => {
				const layer = new L.TileLayer(url, {
					...extractOptions(restProps),
					opacity,
					zIndex
				});
				setupEvent(L, layer, () => restProps);
				instance = layer;
				onCleanup(layer.remove.bind(layer));
				onCleanup(oninit?.call(layer, layer, L));
				resolveLayer(layer);
				onParent?.((p) => {
					layer.addTo(p);
					onCleanup(onparentresolved?.call(layer, p, L));
				});

				watch = () => {
					if (url !== (layer as any)._url) {
						layer.setUrl(url);
					}
					layer.setUrl(url);
					layer.setOpacity(
						opacity === undefined ? L.TileLayer.prototype.options.opacity! : opacity
					);
					layer.setZIndex(zIndex === undefined ? L.TileLayer.prototype.options.zIndex! : zIndex);
					setOptions(layer, L.TileLayer.prototype.options, {
						...extractOptions(restProps),
						opacity,
						zIndex
					});
				};
			});
			return cleanup;
		});
	}
</script>
