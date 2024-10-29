const map = new WeakMap<
	L.Layer,
	{
		popups: Set<L.Popup>;
		tooltips: Set<L.Tooltip>;
	}
>();

export function usePopupHelper() {
	let _popup = null as L.Popup | null;
	let _parent: L.Layer | null = null;
	function bind(parent: L.Layer, popup: L.Popup) {
		if (!map.has(parent)) {
			map.set(parent, {
				popups: new Set(),
				tooltips: new Set()
			});
		}
		const data = map.get(parent)!;
		data.popups.add(popup);
		parent.bindPopup(popup);
		_parent = parent;
		_popup = popup;
	}
	function unbind() {
		if (!_parent || !_popup || !map.has(_parent)) {
			return;
		}
		const data = map.get(_parent)!;
		data.popups.delete(_popup);
		if (data.popups.size) {
			const last = [...data.popups][data.popups.size - 1];
			_parent.bindPopup(last);
		} else {
			_parent.unbindPopup();
		}
	}

	return { bind, unbind };
}

export function useTooltipHelper() {
	let tooltip = null as L.Tooltip | null;
	let parent: L.Layer | null = null;
	function bind(parent: L.Layer, tooltip: L.Tooltip) {
		if (!map.has(parent)) {
			map.set(parent, {
				popups: new Set(),
				tooltips: new Set()
			});
		}
		const data = map.get(parent)!;
		data.tooltips.add(tooltip);
		parent.bindTooltip(tooltip);
	}
	function unbind() {
		if (!parent || !tooltip || !map.has(parent)) {
			return;
		}
		const data = map.get(parent)!;
		data.tooltips.delete(tooltip);
		if (data.tooltips.size) {
			const last = [...data.tooltips][data.tooltips.size - 1];
			parent.bindTooltip(last);
		} else {
			parent.unbindTooltip();
		}
	}

	return { bind, unbind };
}
