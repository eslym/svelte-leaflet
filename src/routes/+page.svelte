<script lang="ts" module>
	let globalId = 1;
</script>

<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import Map from '$lib/Map.svelte';
	import TileLayer from '$lib/TileLayer.svelte';
	import Popup from '$lib/Popup.svelte';
	import LayerGroup from '$lib/LayerGroup.svelte';
	import Marker from '$lib/Marker.svelte';
	import Tooltip from '$lib/Tooltip.svelte';
	import Icon from '$lib/Icon.svelte';

	import iconUrl from 'leaflet/dist/images/marker-icon.png';
	import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
	import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
	import Orphan from '$lib/Orphan.svelte';

	let map: L.Map = $state(undefined as any);
	let contextPopup: L.Popup = $state(undefined as any);
	let markers = $state<
		Record<
			number,
			{
				id: number;
				label?: string;
				latlng: [number, number];
				draggable: boolean;
			}
		>
	>({
		0: {
			id: 0,
			label: 'Kuala Lumpur',
			latlng: [3.140853, 101.693207],
			draggable: false
		}
	});
</script>

<svelte:head>
	<title>svelte-leaflet demo</title>
</svelte:head>

{#snippet icon()}
	<Icon
		icon={iconUrl}
		{iconRetinaUrl}
		{shadowUrl}
		iconSize={[25, 41]}
		iconAnchor={[12, 41]}
		popupAnchor={[1, -34]}
		tooltipAnchor={[16, -28]}
		shadowSize={[41, 41]}
	/>
{/snippet}

{#snippet pinIcon(size: number, className: string = '')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={size}
		height={size}
		color="curretColor"
		fill="none"
		class={className}
	>
		<path
			d="M7 18C5.17107 18.4117 4 19.0443 4 19.7537C4 20.9943 7.58172 22 12 22C16.4183 22 20 20.9943 20 19.7537C20 19.0443 18.8289 18.4117 17 18"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<path
			d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M13.2574 17.4936C12.9201 17.8184 12.4693 18 12.0002 18C11.531 18 11.0802 17.8184 10.7429 17.4936C7.6543 14.5008 3.51519 11.1575 5.53371 6.30373C6.6251 3.67932 9.24494 2 12.0002 2C14.7554 2 17.3752 3.67933 18.4666 6.30373C20.4826 11.1514 16.3536 14.5111 13.2574 17.4936Z"
			stroke="currentColor"
			stroke-width="1.5"
		/>
	</svg>
{/snippet}

{#snippet disabledIcon(size: number, className: string = '')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={size}
		height={size}
		color="currentColor"
		fill="none"
		class={className}
	>
		<path
			d="M5.25 5L19.25 19"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M22.25 12C22.25 6.47715 17.7728 2 12.25 2C6.72715 2 2.25 6.47715 2.25 12C2.25 17.5228 6.72715 22 12.25 22C17.7728 22 22.25 17.5228 22.25 12Z"
			stroke="currentColor"
			stroke-width="1.5"
		/>
	</svg>
{/snippet}

{#snippet lockIcon(size: number, className: string = '')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={size}
		height={size}
		color="currentColor"
		fill="none"
		class={className}
	>
		<path
			d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12104 13.2453 4 14.3624 4 15.5C4 16.6376 4.12104 17.7547 4.26781 18.8447Z"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M11.9961 15.5H12.0051"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/snippet}

{#snippet unlockIcon(size: number, className: string = '')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={size}
		height={size}
		color="currentColor"
		fill="none"
		class={className}
	>
		<path
			d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12104 13.2453 4 14.3624 4 15.5C4 16.6376 4.12104 17.7547 4.26781 18.8447Z"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C13.9593 2 15.5 3.5 16 5"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M11.9961 15.5H12.0051"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/snippet}

{#snippet trashIcon(size: number, className: string = '')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={size}
		height={size}
		color="currentColor"
		fill="none"
		class={className}
	>
		<path
			d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<path
			d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<path d="M9.5 16.5L9.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		<path
			d="M14.5 16.5L14.5 10.5"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
	</svg>
{/snippet}

<div class="container">
	<Map
		bind:instance={map}
		center={[3.140853, 101.693207]}
		zoom={13}
		oncontextmenu={(ev) => {
			contextPopup.setLatLng(ev.latlng);
			contextPopup.openOn(map);
		}}
	>
		<TileLayer
			url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
			maxZoom={19}
			subdomains={['a', 'b', 'c']}
			pane="tilePane"
			attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
		/>
		<LayerGroup>
			{#each Object.keys(markers) as id (id)}
				{@const marker = markers[id as any]}
				<Marker
					bind:latlng={marker.latlng}
					bind:draggable={marker.draggable}
					interactive
					riseOnHover
					ondblclick={() => map.setView(marker.latlng)}
					onpopupclose={(ev) => {
						// unbind the popup so we can bind different popup later
						ev.target.unbindPopup();
					}}
				>
					{#snippet children(mark)}
						{@render icon()}
						{#if mark}
							<Orphan>
								<Popup
									content={marker.label ?? `#${marker.id}`}
									oninit={(p) => {
										mark.on('click', () => {
											mark.bindPopup(p);
											mark.openPopup();
										});
										mark.on('keypress', (ev) => {
											if (ev.originalEvent.key === 'Enter') {
												mark.bindPopup(p);
												mark.openPopup();
											}
										});
									}}
								/>
								<Popup
									interactive
									class="map-context-menu"
									closeButton={false}
									oninit={(p) => {
										mark.on('contextmenu', () => {
											mark.bindPopup(p);
											mark.openPopup();
										});
									}}
								>
									{#snippet children(popup)}
										<div>
											<input class="label-input" placeholder="#{id}" bind:value={marker.label} />
										</div>
										<div class="menu" style:flex-direction="row">
											<button
												class="menu-item"
												onclick={() => {
													markers[marker.id].draggable = !marker.draggable;
													// rebind the popup is necessary to reset the event handler,
													// otherwise the popup might not closed when marker moved
													mark.unbindPopup();
													mark.bindPopup(popup);
													mark.openPopup();
												}}
												style:flex-grow="1"
												style:justify-content="center"
											>
												{#if marker.draggable}
													{@render unlockIcon(16)}
												{:else}
													{@render lockIcon(16)}
												{/if}
											</button>
											<button
												class="menu-item"
												onclick={() => {
													delete markers[marker.id];
												}}
												style:flex-grow="1"
												style:justify-content="center"
											>
												{@render trashIcon(16)}
											</button>
										</div>
									{/snippet}
								</Popup>
							</Orphan>
						{/if}
						<Tooltip content={marker.label ?? `#${id}`} />
					{/snippet}
				</Marker>
			{/each}
		</LayerGroup>
	</Map>
</div>

<Popup bind:instance={contextPopup} closeButton={false} interactive class="map-context-menu">
	{#snippet children(popup)}
		<div class="menu">
			<button
				class="menu-item"
				onclick={() => {
					const id = globalId++;
					const latlng = popup.getLatLng()!;
					markers[id] = { id, latlng: [latlng.lat, latlng.lng], draggable: true };
					popup.close();
				}}
			>
				Add Marker
				{@render pinIcon(14)}
			</button>
			<button class="menu-item" disabled>
				Disabled Button
				{@render disabledIcon(14)}
			</button>
		</div>
	{/snippet}
</Popup>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
	}

	div.container :global(.map-context-menu) {
		cursor: default;
	}

	div.container :global(.map-context-menu .leaflet-popup-content) {
		margin: 0.5rem;
		padding: 0;
		font-size: 0.85rem;
	}

	div.container {
		width: 100vw;
		height: 100vh;
	}

	div.menu {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	button.menu-item {
		all: unset;
		transition:
			background-color 150ms,
			transform 150ms,
			outline-color 150ms,
			outline-offset 150ms;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.25rem 1rem;
		transform-origin: center center;
		border-radius: 0.25rem;
		outline: 2px solid transparent;
		user-select: none;
	}

	button.menu-item:focus-visible {
		outline-color: rgb(0 120 212 / 0.65);
		outline-offset: 2px;
	}

	button.menu-item:disabled {
		opacity: 0.65;
		cursor: default;
	}

	button.menu-item:hover:not(:disabled) {
		background-color: #f0f0f0;
	}

	button.menu-item:active:not(:disabled) {
		transform: scale(0.95);
	}

	input.label-input {
		all: unset;
		display: block;
		margin: 0.25rem 0.5rem 0.5rem 0.5rem;
		padding: 0.125rem 0.25rem;
		cursor: text;
		border-bottom: transparent 1px solid;
		font-weight: 600;
	}

	input.label-input::placeholder {
		color: #aaaaaa;
	}

	input.label-input:focus {
		border-bottom: #cccccc 1px solid;
	}
</style>
