import type { Subscription, BlocZone } from '../types'

/**
 * Creates a BlocZone with the provided initial state.
 *
 * @template S
 * @param {S} initialState - The initial state of the BlocZone.
 * @returns {BlocZone<S>} The created BlocZone.
 */
export function createBlocZone<S extends object>(initialState: S): BlocZone<S> {
	/** @type {WeakMap<object, Subscription<S>>} Mapping of object keys to listener functions */
	const _listeners = new WeakMap<object, Subscription<S>>()

	/** @type {Set<object>} Set of objects that are subscribed to this Bloc */
	const _listenerKeys = new Set<object>()

	/** @type {WeakMap<object, Set<keyof S>>} Mapping of object keys to the properties they are subscribed to */
	const _dependencies = new WeakMap<object, Set<keyof S>>()

	let activeEffect: Subscription<S> | null = null

	const effect = (eff: () => void) => {
		activeEffect = eff
		eff()
		activeEffect = null
	}

	const _track = (target: object, key: keyof S) => {
		if (activeEffect) {
			let deps = _dependencies.get(target)
			if (!deps) {
				_dependencies.set(target, (deps = new Set()))
			}
			deps.add(key)
		}
	}

	const _trigger = (target: object, key: keyof S) => {
		const deps = _dependencies.get(target)
		if (deps && deps.has(key)) {
			const listener = _listeners.get(target as S)
			if (listener) {
				listener(target as S)
			}
		}
	}

	const state = new Proxy(initialState, {
		get: (target, key) => {
			const value = Reflect.get(target, key)
			_track(state, key as keyof S)
			return value
		},
		set: (target, key, value) => {
			const oldValue = target[key as keyof S]
			if (oldValue !== value) {
				Reflect.set(target, key, value)
				_trigger(target, key as keyof S)
			}
			return true
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
	const setState = (newState: Partial<S>) => {
		for (const key in newState) {
			state[key as keyof S] = newState[key as keyof S]!
			_trigger(state, key as keyof S)
		}
	}
	const subscribe = (target: object, listener: Subscription<S>, keys: Array<keyof S>): void => {
		if (_listenerKeys.has(target)) {
			console.warn('Object is already subscribed to this Bloc')
		}
		_listeners.set(target, listener)
		_listenerKeys.add(target)
		_dependencies.set(target, new Set(keys))
		effect(() => {
			keys.forEach((key) => state[key])
			listener(state)
		})
	}

	const subscribeAll = (obj: object, listener: Subscription<S>): void => {
		if (_listenerKeys.has(obj)) {
			console.warn('Object is already subscribed to this Bloc')
		}

		const keys = Object.keys(state) as Array<keyof S>
		_listeners.set(obj, listener)
		_listenerKeys.add(obj)
		_dependencies.set(obj, new Set(keys))
		effect(() => {
			keys.forEach((key) => state[key])
			listener(state)
		})
	}

	const unsubscribe = (obj: object): void => {
		if (!_listenerKeys.has(obj)) {
			console.warn('Object is not subscribed to this Bloc')
		}
		_listeners.delete(obj)
		_listenerKeys.delete(obj)
	}

	return {
		getRawState,
		getState,
		setState,
		subscribe,
		subscribeAll,
		unsubscribe
	}
}
