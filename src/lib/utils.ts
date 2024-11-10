import { BROWSER } from 'esm-env';
import type { LeafletEventHandlerFnMap } from 'leaflet';
import type { BaseProps } from './types.js';
import { onDestroy } from 'svelte';

let leafletPromise: typeof import('leaflet') | null = null;
const pending: Set<(L: typeof import('leaflet')) => void> = new Set();

if (BROWSER) {
	import('leaflet').then((L) => {
		leafletPromise = L;

		const SvelteIcon = L.Icon.extend({
			_icon: undefined as any as HTMLElement,
			_shadow: undefined as any as HTMLElement,

			initialize(options: () => L.BaseIconOptions) {
				delete this.options;
				Object.defineProperty(this, 'options', {
					get: () => {
						const opt = options();
						Object.setPrototypeOf(opt, L.Icon.prototype.options);
						return opt;
					}
				});
			},

			createIcon() {
				return this._icon;
			},

			createShadow() {
				return this._shadow;
			}
		});

		(L as any).__svelteIcon = SvelteIcon;

		(L.default as any).__svelteIcon = SvelteIcon;

		for (const callback of pending) {
			callback(L);
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

export function setOptions(target: { options: any }, base: any, options: any) {
	const opts = { ...options };
	Object.setPrototypeOf(opts, base);
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
	onDestroy(() => {
		for (const fn of cleanupFns) {
			fn();
		}
	});
	return (fn: any) => {
		if (typeof fn === 'function') cleanupFns.add(fn);
	};
}

const callbacks = new Map<
	HTMLElement,
	Set<(el: HTMLElement, width: number, height: number) => void>
>();

const observer = BROWSER
	? new ResizeObserver(() => {
			for (const [el, fns] of callbacks) {
				const { width, height } = el.getBoundingClientRect();
				for (const fn of fns) {
					fn(el, width, height);
				}
			}
		})
	: undefined;

export function onresize<E extends HTMLElement>(
	el: E,
	callback: (el: E, width: number, height: number) => void
) {
	if (!observer) return;
	if (!callbacks.has(el)) {
		callbacks.set(el, new Set());
		observer.observe(el);
	}
	callbacks.get(el)!.add(callback as any);

	const { width, height } = el.getBoundingClientRect();
	callback(el, width, height);

	return {
		destroy() {
			const fns = callbacks.get(el);
			if (fns) {
				fns.delete(callback as any);
				if (!fns.size) {
					callbacks.delete(el);
					observer.unobserve(el);
				}
			}
		}
	};
}
