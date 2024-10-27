<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { kMarker, resolveContext } from './context.js';
	import { BROWSER } from 'esm-env';
	import { importLeaflet } from './utils.js';

	type $$Props =
		| ({ icon: string } & Omit<L.IconOptions, 'iconUrl'>)
		| ({ icon: Snippet } & Omit<L.DivIconOptions, 'html'>);

	const markerReady = resolveContext(kMarker, false);

	let { icon, ...options }: $$Props = $props();

	let iconDiv: HTMLDivElement = $state(undefined as any);

	if (BROWSER) {
		onMount(() => {
			iconDiv.remove();
			importLeaflet((L) => {
				const i =
					typeof icon === 'string'
						? L.icon({ ...options, iconUrl: icon })
						: L.divIcon({ ...options, html: iconDiv });
				markerReady?.((marker) => {
					marker.setIcon(i);
				});
			});
		});
	}
</script>

{#if BROWSER}
	<div bind:this={iconDiv}>
		{#if typeof icon !== 'string'}
			{@render icon()}
		{/if}
	</div>
{/if}

<style>
	div {
		display: contents;
	}
</style>
