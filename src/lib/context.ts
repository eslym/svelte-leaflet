import { getContext, setContext } from 'svelte';
import { withResolvers } from './utils.js';

export const kMap: unique symbol = Symbol('map');
export const kGroup: unique symbol = Symbol('group');
export const kLayer: unique symbol = Symbol('layer');
export const kMarker: unique symbol = Symbol('marker');

type ContextSymbol = typeof kMap | typeof kGroup | typeof kLayer | typeof kMarker;

type OnResolve<T> = (callback: (value: T) => void) => void;

type SymbolMap = {
	[kMap]: OnResolve<L.Map>;
	[kGroup]: OnResolve<L.LayerGroup | L.Map>;
	[kLayer]: OnResolve<L.Layer>;
	[kMarker]: OnResolve<L.Marker>;
};

export function initContext<T>(
	...symbols: [primary: ContextSymbol, ...rest: ContextSymbol[]]
): (value: T) => void {
	const { promise, resolve } = withResolvers<T>();
	const onResolve = promise.then.bind(promise);
	for (const symbol of symbols) {
		setContext(symbol, onResolve);
	}
	return resolve;
}

export function resolveContext<T extends ContextSymbol>(symbol: T, required?: true): SymbolMap[T];
export function resolveContext<T extends ContextSymbol>(
	symbol: T,
	required: false
): SymbolMap[T] | undefined;
export function resolveContext<T extends ContextSymbol>(symbol: T, required = true) {
	const promise = getContext(symbol);
	if (required && !promise) throw new Error('Context not initialized');
	return promise;
}
