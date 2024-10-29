<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseProps } from './types.js';
	import { BROWSER } from 'esm-env';
	import { kLayer, resolveContext } from './context.js';
	import {
		coordsEqual,
		destroy,
		extractOptions,
		importLeaflet,
		latlngExp,
		noop,
		setOptions
	} from './utils.js';

	interface $$Props extends BaseProps<L.Popup>, Omit<L.PopupOptions, 'content' | 'className'> {
		class?: string;
		latlng?: [number, number];
		content?: string;
	}

	const onParent = resolveContext(kLayer, false);

	let {
		children = undefined,
		content = undefined,
		class: className = undefined,
		instance = $bindable(undefined as any),
		oninit = undefined,
		latlng = undefined,
		...restProps
	}: $$Props = $props();

	let div: HTMLDivElement = $state(undefined as any);
	let watch = noop;

	$effect(() => watch(className, latlng, restProps));

	if (BROWSER) {
		onMount(() => {
			div.remove();
			let popup: L.Popup = undefined as any;
			let parent: L.Layer = undefined as any;
			importLeaflet((L) => {
				popup = new L.Popup({
					...extractOptions(restProps),
					className,
					content: div
				});
				if (latlng) {
					popup.setLatLng(latlng);
				}
				oninit?.(popup, L);
				onParent?.((p) => {
					parent = p;
					p.bindPopup(popup);
				});
				instance = popup;

				watch = () => {
					const el = popup.getElement();
					if (el) el.className = className ?? '';
					if (latlng) {
						const prev = popup.getLatLng();
						if (prev) {
							if (!coordsEqual(latlngExp(prev), latlng)) {
								popup.setLatLng(latlng);
							}
						} else {
							popup.setLatLng(latlng);
						}
					}
					setOptions(popup, L.Popup, {
						...extractOptions(restProps),
						className,
						content: div
					});
				};
			});
			return () =>
				destroy(popup, () => {
					parent?.unbindPopup();
				});
		});
	}
</script>

{#if BROWSER}
	<div bind:this={div}>
		{#if children}
			{@render children(instance)}
		{:else}
			{content}
		{/if}
	</div>
{/if}
