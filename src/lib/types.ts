import type { Snippet } from 'svelte';

export type PrefixWith<T extends Record<string, any>, P extends string> = {
	[K in `${P}${keyof T extends string | number ? keyof T : never}`]?: K extends `${P}${infer U}`
		? T[U]
		: never;
};

export type EventProps<T extends Record<string, (...args: any[]) => any>, C> = {
	[K in keyof T]: (
		this: C,
		ev: Omit<Parameters<T[K]>[0], 'target'> & { target: C },
		L: typeof import('leaflet')
	) => void;
};

export type BaseProps<T> = {
	children?: Snippet<[T]>;
	instance?: T;
	oninit?: (this: T, instance: T, L: typeof import('leaflet')) => void;
} & EventProps<PrefixWith<L.LeafletEventHandlerFnMap, 'on'>, T>;
