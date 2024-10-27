<script lang="ts">
	import { destroy, extractOptions, importLeaflet, setupEvent } from './utils.js';
	import { onMount } from 'svelte';
	import { BROWSER } from 'esm-env';
	import { initContext, kGroup, resolveContext } from './context.js';
	import type { BaseProps } from './types.js';

	interface $$Props extends BaseProps<L.LayerGroup>, L.LayerOptions {}

	const onParent = resolveContext(kGroup, false);
	const resolveGroup = initContext<L.LayerGroup>(kGroup);
	let group: L.LayerGroup | undefined = undefined;

	let {
		children = undefined,
		instance = $bindable(undefined as any),
		oninit = undefined,
		...restProps
	}: $$Props = $props();

	if (BROWSER) {
		onMount(() => {
			importLeaflet((L) => {
				group = new L.LayerGroup([], extractOptions(restProps));
				setupEvent(L, group, () => restProps);
				oninit?.(group, L);
				resolveGroup(group);
				onParent?.((p) => group!.addTo(p));
				instance = group;
			});
			return () => destroy(group);
		});
	}
</script>

{#if BROWSER}
	{@render children?.(instance)}
{/if}
