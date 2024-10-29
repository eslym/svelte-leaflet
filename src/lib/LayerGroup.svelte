<script lang="ts">
	import { extractOptions, importLeaflet, setupEvent, useCleanup } from './utils.js';
	import { onMount } from 'svelte';
	import { BROWSER } from 'esm-env';
	import { initContext, kGroup, resolveContext } from './context.js';
	import type { BaseProps } from './types.js';

	interface $$Props extends BaseProps<L.LayerGroup, L.LayerGroup | L.Map>, L.LayerOptions {}

	const { onCleanup, cleanup } = useCleanup();
	const onParent = resolveContext(kGroup, false);
	const resolveGroup = initContext<L.LayerGroup>(kGroup);

	let {
		children = undefined,
		instance = $bindable(undefined as any),
		oninit = undefined,
		onparentresolved = undefined,
		...restProps
	}: $$Props = $props();

	if (BROWSER) {
		onMount(() => {
			importLeaflet((L) => {
				const group = new L.LayerGroup([], extractOptions(restProps));
				setupEvent(L, group, () => restProps);
				instance = group;
				onCleanup(group.remove.bind(group));
				onCleanup(oninit?.call(group, group, L));
				resolveGroup(group);
				onParent?.((p) => {
					group.addTo(p);
					onCleanup(onparentresolved?.call(group, p, L));
				});
			});
			return cleanup;
		});
	}
</script>

{#if BROWSER}
	{@render children?.(instance)}
{/if}
