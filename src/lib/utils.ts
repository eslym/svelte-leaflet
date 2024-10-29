import { BROWSER } from 'esm-env';
import type { LeafletEventHandlerFnMap } from 'leaflet';
import type { BaseProps } from './types.js';

let leafletPromise: typeof import('leaflet') | null = null;
const pending: Set<(L: typeof import('leaflet')) => void> = new Set();

if (BROWSER) {
	import('leaflet').then((mod) => {
		leafletPromise = mod;
		for (const callback of pending) {
			callback(mod);
		}
		pending.clear();
	});
}

export const withResolvers =
	'withResolvers' in Promise
		? Promise.withResolvers.bind(Promise)
		: <T>() => {
				let resolve: (value: any) => void = undefined as any;
				let reject: (reason: any) => void = undefined as any;
				const promise = new Promise((res, rej) => {
					resolve = res;
					reject = rej;
				});
				return {
					promise,
					resolve,
					reject
				} as PromiseWithResolvers<T>;
			};

export function importLeaflet(callback: (L: typeof import('leaflet')) => void) {
	if (leafletPromise) {
		callback(leafletPromise);
		return;
	}
	if (BROWSER) {
		pending.add(callback);
	}
}

type EventStriped<T extends Record<string, any>> = {
	[K in keyof T]: K extends `on${string}` ? never : T[K];
};

export function extractOptions<T extends Record<string, any>>(props: T): EventStriped<T> {
	const propsCopy = { ...props };

	for (const key in propsCopy) {
		if (key.startsWith('on')) {
			delete propsCopy[key];
		}
	}

	return propsCopy;
}

const events = [
	'baselayerchange',
	'overlayadd',
	'overlayremove',
	'layeradd',
	'layerremove',
	'zoomlevelschange',
	'unload',
	'viewreset',
	'load',
	'zoomstart',
	'movestart',
	'zoom',
	'move',
	'zoomend',
	'moveend',
	'autopanstart',
	'dragstart',
	'drag',
	'add',
	'remove',
	'loading',
	'error',
	'update',
	'down',
	'predrag',
	'resize',
	'popupopen',
	'popupclose',
	'tooltipopen',
	'tooltipclose',
	'locationerror',
	'locationfound',
	'click',
	'dblclick',
	'mousedown',
	'mouseup',
	'mouseover',
	'mouseout',
	'mousemove',
	'contextmenu',
	'preclick',
	'keypress',
	'keydown',
	'keyup',
	'zoomanim',
	'dragend',
	'tileunload',
	'tileloadstart',
	'tileload',
	'tileabort',
	'tileerror'
] as const;

export function setupEvent(
	L: typeof import('leaflet'),
	target: L.Evented,
	dispatch: () => BaseProps<any>,
	handlers: LeafletEventHandlerFnMap = {}
) {
	for (const event of events) {
		target.on(event, (ev) => {
			handlers[event]?.(ev as any);
			dispatch()[`on${event}`]?.call(target, ev as any, L);
		});
	}
}

export function syncHandler(handler: L.Handler | undefined, state: boolean | string) {
	handler?.[state ? 'enable' : 'disable']();
}

export function setOptions(
	target: { options: any },
	type: { prototype: { options: any } },
	options: any
) {
	const opts = { ...options };
	Object.setPrototypeOf(opts, type.prototype.options);
	target.options = opts;
}

export const noop: (...args: any[]) => any = () => {};

export function coordsEqual(a: (number | number[])[], b: (number | number[])[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (Array.isArray(a[i]) && Array.isArray(b[i])) {
			if (!coordsEqual(a[i] as number[], b[i] as number[])) return false;
		} else if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}

export function latlngExp(latlng: L.LatLng) {
	return [latlng.lat, latlng.lng] as [number, number];
}

export function boundsExp(bounds: L.LatLngBounds) {
	const sw = bounds.getNorthEast();
	const ne = bounds.getNorthEast();
	return [
		[sw.lat, sw.lng],
		[ne.lat, ne.lng]
	] as [[number, number], [number, number]];
}

export function useCleanup() {
	const cleanupFns = new Set<() => void>();
	return {
		onCleanup(fn: any) {
			if (typeof fn === 'function') cleanupFns.add(fn);
		},
		cleanup() {
			for (const fn of cleanupFns) {
				fn();
			}
		}
	};
}
