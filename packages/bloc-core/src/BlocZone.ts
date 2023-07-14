import type { Subscription, BlocZone } from './types'

/**
 * Creates a BlocZone with the provided initial state.
 *
 * @template S
 * @param {S} initialState - The initial state of the BlocZone.
 * @returns {BlocZone<S>} The created BlocZone.
 */
export default function createBlocZone<S extends object>(initialState: S): BlocZone<S> {
	/** @type {WeakMap<object, Subscription<S>>} Mapping of object keys to listener functions */
	const _listeners = new WeakMap<object, Subscription<S>>()

	/** @type {Map<object, null>} Mapping of object keys to null values */
	const _listenerKeys = new Map<object, null>()

	const state = new Proxy(initialState, {
		set: (target, key, value) => {
			const newState = { ...target, [key]: value } as S
			Array.from(_listenerKeys.keys()).forEach((obj) => {
				const listener = _listeners.get(obj)
				if (listener) {
					listener(newState)
				} else {
					_listenerKeys.delete(obj)
				}
			})
			return Reflect.set(target, key, value)
		}
	})

	/** @type {WeakMap<object, S>} Mapping of object keys to original state */
	const originalStateMap = new WeakMap<object, S>()
	originalStateMap.set(state, initialState)

	const getRawState = (): S => {
		const rawState = originalStateMap.get(state)
		if (!rawState) {
			throw new Error('State not found in originalStateMap')
		}
		return rawState
	}
	const getState = (): S => state
	const setState = (newState: S) => Object.assign(state, newState)
	const subscribe = (obj: object, listener: Subscription<S>): void => {
		if (_listenerKeys.has(obj)) {
			throw new Error('Object is already subscribed to this Bloc')
		}
		_listeners.set(obj, listener)
		_listenerKeys.set(obj, null)
	}
	const unsubscribe = (obj: object): void => {
		if (!_listenerKeys.has(obj)) {
			throw new Error('Object is not subscribed to this Bloc')
		}
		_listeners.delete(obj)
		_listenerKeys.delete(obj)
	}

	return {
		getRawState,
		getState,
		setState,
		subscribe,
		unsubscribe
	}
}
