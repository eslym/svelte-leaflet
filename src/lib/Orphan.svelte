<script lang="ts">
	import type { Snippet } from 'svelte';
	import { initContext, kGroup, kLayer, kMap, kMarker } from './context.js';

	let { children }: { children: Snippet } = $props();

	initContext(kMap, kLayer, kGroup, kMarker);
</script>

{@render children()}
