<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { kMarker, resolveContext } from './context.js';
	import { BROWSER } from 'esm-env';
	import { importLeaflet, onresize } from './utils.js';
	import type { HTMLImgAttributes } from 'svelte/elements';

	type $$Props = (
		| {
				icon: string;
				iconRetinaUrl?: string;
				children?: never;
				crossOrigin?: HTMLImgAttributes['crossorigin'];
		  }
		| {
				icon?: never;
				iconRetinaUrl?: never;
				children: Snippet;
				crossOrigin?: never;
		  }
	) &
		(
			| {
					shadow?: string;
					shadowRetinaUrl?: string;
			  }
			| {
					shadow: Snippet;
					shadowRetinaUrl?: never;
			  }
		) & {
			iconSize?: [number, number];
			iconAnchor?: [number, number];
			popupAnchor?: [number, number];
			tooltipAnchor?: [number, number];
			shadowSize?: [number, number];
			shadowAnchor?: [number, number];
			class?: string;
		};

	const markerReady = resolveContext(kMarker, false);

	let {
		children,
		icon,
		iconRetinaUrl,
		crossOrigin,
		shadow,
		shadowRetinaUrl,
		iconSize,
		iconAnchor,
		shadowSize,
		shadowAnchor,
		class: classNames,
		...options
	}: $$Props = $props();

	let iconDiv: HTMLElement = $state(undefined as any);
	let shadowDiv: HTMLElement = $state(undefined as any);

	let retina = $state(false);

	let iconUrl = $derived((retina ? iconRetinaUrl : icon) ?? icon!);
	let shadowUrl = $derived((retina ? shadowRetinaUrl : (shadow as string)) ?? (shadow as string));

	let iconSizes = $derived(iconSize?.map(px) ?? ['', '']);
	let shadowSizes = $derived(shadowSize?.map(px) ?? ['', '']);

	let iconDivSize: [number, number] = $state([0, 0]);
	let shadowDivSize: [number, number] = $state([0, 0]);

	let iconMargins = $derived(calculateMargins(iconSize ?? iconDivSize, iconAnchor));
	let shadowMargins = $derived(
		calculateMargins(shadowSize ?? iconSize ?? shadowDivSize, shadowAnchor ?? iconAnchor)
	);

	function px(v: number) {
		return `${v}px`;
	}

	function calculateMargins(
		size: [number, number] | undefined,
		anchor: [number, number] | undefined
	): [string, string] {
		if (size && anchor) {
			return [px(-anchor[0]), px(-anchor[1])];
		}
		if (size) {
			return [px(-size[0] / 2), px(-size[1] / 2)];
		}
		return ['', ''];
	}

	if (BROWSER) {
		onMount(() => {
			iconDiv.remove();
			shadowDiv.remove();
			importLeaflet((L) => {
				retina = L.Browser.retina;
				const i: L.Icon = new (L as any).__svelteIcon(options) as L.Icon;
				(i as any)._icon = iconDiv;
				(i as any)._shadow = shadowDiv;
				markerReady?.((marker) => {
					marker.setIcon(i);
				});
			});
		});
	}
</script>

{#if BROWSER}
	<div
		class="leaflet-marker-icon"
		bind:this={iconDiv}
		style:width={iconSizes[0]}
		style:height={iconSizes[1]}
		style:margin-left={iconMargins[0]}
		style:margin-top={iconMargins[1]}
		use:onresize={(_, w, h) => (iconDivSize = [w, h])}
	>
		{#if typeof icon === 'string'}
			<!-- svelte-ignore a11y_missing_attribute -->
			<img
				class={classNames}
				src={iconUrl}
				crossorigin={crossOrigin}
				style:width={iconSizes[0]}
				style:height={iconSizes[1]}
			/>
		{:else}
			<div class={classNames} style:width={iconSizes[0]} style:height={iconSizes[1]}>
				{@render children!()}
			</div>
		{/if}
	</div>
	<div
		class="leaflet-marker-shadow"
		bind:this={shadowDiv}
		style:width={shadowSizes[0]}
		style:height={shadowSizes[1]}
		style:margin-left={shadowMargins[0]}
		style:margin-top={shadowMargins[1]}
		use:onresize={(_, w, h) => (shadowDivSize = [w, h])}
	>
		{#if shadow}
			{#if typeof shadow === 'string'}
				<!-- svelte-ignore a11y_missing_attribute -->
				<img
					class={classNames}
					src={shadowUrl}
					style:width={shadowSizes[0]}
					style:height={shadowSizes[1]}
				/>
			{:else}
				<div class={classNames} style:width={shadowSizes[0]} style:height={shadowSizes[1]}>
					{@render shadow!()}
				</div>
			{/if}
		{/if}
	</div>
{/if}
