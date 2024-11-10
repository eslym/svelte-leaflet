<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseProps } from './types.js';
	import { BROWSER } from 'esm-env';
	import { kLayer, resolveContext } from './context.js';
	import {
		coordsEqual,
		extractOptions,
		importLeaflet,
		latlngExp,
		noop,
		setOptions,
		useCleanup
	} from './utils.js';
	import { useTooltipHelper } from './bind-helper.js';

	type $$Props = Omit<BaseProps<L.Tooltip, L.Layer>, 'children'> &
		Omit<L.TooltipOptions, 'content' | 'className'> & {
			class?: string;
			latlng?: [number, number];
		} & (
			| {
					children: (popup: L.Tooltip) => any;
					content?: never;
			  }
			| {
					children?: never;
					content: string;
			  }
		);

	const onCleanup = useCleanup();
	const onParent = resolveContext(kLayer, false);
	const helper = useTooltipHelper();
	onCleanup(helper.unbind);

	let {
		children = undefined,
		content = undefined,
		class: className = undefined,
		instance = $bindable(undefined as any),
		oninit = undefined,
		onparentresolved = undefined,
		latlng = undefined,
		...restProps
	}: $$Props = $props();

	let div: HTMLDivElement = $state(undefined as any);
	let watch = noop;

	$effect(() => watch(className, latlng, restProps));

	if (BROWSER) {
		onMount(() => {
			div.remove();
			importLeaflet((L) => {
				const tooltip = new L.Tooltip({
					...extractOptions(restProps),
					className,
					content: div
				});
				if (latlng) {
					tooltip.setLatLng(latlng);
				}
				instance = tooltip;
				onCleanup(tooltip.remove.bind(tooltip));
				onCleanup(oninit?.call(tooltip, tooltip, L));
				onParent?.((p) => {
					helper.bind(p, tooltip);
					onparentresolved?.call(tooltip, tooltip, L);
				});

				watch = () => {
					const el = tooltip.getElement();
					if (el) el.className = className ?? '';
					if (latlng) {
						const prev = tooltip.getLatLng();
						if (prev) {
							if (!coordsEqual(latlngExp(prev), latlng)) {
								tooltip.setLatLng(latlng);
							}
						} else {
							tooltip.setLatLng(latlng);
						}
					}
					setOptions(tooltip, L.Tooltip.prototype.options, {
						...extractOptions(restProps),
						className,
						content: div
					});
				};
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
