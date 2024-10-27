import type { Snippet } from 'svelte';

export type PrefixWith<T extends Record<string, any>, P extends string> = {
	[K in `${P}${keyof T extends string | number ? keyof T : never}`]?: K extends `${P}${infer U}`
		? T[U]
		: never;
};

export type EventProps<T extends Record<string, (...args: any[]) => any>, C> = {
	[K in keyof T]: (this: C, ev: Parameters<T[K]>[0], L: typeof import('leaflet')) => void;
};

export type BaseProps<T> = {
	children?: Snippet<[T]>;
	instance?: T;
	oninit?: (instance: T, L: typeof import('leaflet')) => void;
} & EventProps<PrefixWith<L.LeafletEventHandlerFnMap, 'on'>, T>;