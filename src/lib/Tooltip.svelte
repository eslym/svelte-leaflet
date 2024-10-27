<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseProps } from './types.js';
	import { BROWSER } from 'esm-env';
	import { kLayer, resolveContext } from './context.js';
	import { destroy, extractOptions, importLeaflet, noop, setOptions } from './utils.js';

	interface $$Props extends BaseProps<L.Tooltip>, Omit<L.TooltipOptions, 'content' | 'className'> {
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
			let tooltip: L.Tooltip = undefined as any;
			importLeaflet((L) => {
				tooltip = new L.Tooltip({
					...extractOptions(restProps),
					className,
					content: div
				});
				if (latlng) {
					tooltip.setLatLng(latlng);
				}
				oninit?.(tooltip, L);
				onParent?.((p) => p.bindTooltip(tooltip));
				instance = tooltip;

				watch = () => {
					const el = tooltip.getElement();
					if (el) el.className = className ?? '';
					if (latlng) {
						const prev = tooltip.getLatLng();
						if (prev && (prev.lat !== latlng[0] || prev.lng !== latlng[1])) {
							tooltip.setLatLng(latlng);
						}
					}
					setOptions(tooltip, L.Tooltip, {
						...extractOptions(restProps),
						className,
						content: div
					});
				};
			});
			return () => destroy(tooltip);
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
