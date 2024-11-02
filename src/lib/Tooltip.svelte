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

	const { onCleanup, cleanup } = useCleanup();
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
				const popup = new L.Tooltip({
					...extractOptions(restProps),
					className,
					content: div
				});
				if (latlng) {
					popup.setLatLng(latlng);
				}
				instance = popup;
				onCleanup(popup.remove.bind(popup));
				onCleanup(oninit?.call(popup, popup, L));
				onParent?.((p) => {
					helper.bind(p, popup);
					onparentresolved?.call(popup, popup, L);
				});

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
					setOptions(popup, L.Tooltip, {
						...extractOptions(restProps),
						className,
						content: div
					});
				};
			});
			return cleanup;
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
