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
	const _subscriberCallbacks = new WeakMap<object, Subscription<S>>()

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

	const _trackListeners = (target: object, key: keyof S) => {
		if (activeEffect) {
			let deps = _dependencies.get(target)
			if (!deps) {
				_dependencies.set(target, (deps = new Set()))
			}
			deps.add(key)
		}
	}

	const _notifyListeners = (target: object, key: keyof S) => {
		_listenerKeys.forEach((obj) => {
			const deps = _dependencies.get(obj)
			if (deps && deps.has(key)) {
				const listener = _subscriberCallbacks.get(obj)
				if (listener) {
					effect(() => listener(target as S))
				}
			}
		})
	}

	const _subscribeObject = (obj: object, listener: Subscription<S>, keys: Array<keyof S>) => {
		if (_checkSubscription(obj, false)) {
			return
		}

		_subscriberCallbacks.set(obj, listener)
		_listenerKeys.add(obj)
		_dependencies.set(obj, new Set(keys))
		effect(() => {
			keys.forEach((key) => state[key])
			listener(state)
		})
	}

	const _checkSubscription = (obj: object, shouldExist: boolean) => {
		const exists = _listenerKeys.has(obj)
		if (shouldExist && !exists) {
			console.warn(`Object is not subscribed to this Bloc: ${obj}`)
		} else if (!shouldExist && exists) {
			console.warn(`Object is already subscribed to this Bloc: ${obj}`)
		}
		return exists
	}


	const state = new Proxy(initialState, {
		get: (target, key) => {
			const value = Reflect.get(target, key)
			_trackListeners(state, key as keyof S)
			return value
		},
		set: (target, key, value) => {
			const oldValue = target[key as keyof S]
			Reflect.set(target, key, value)
			if (oldValue !== value) {
				_notifyListeners(target, key as keyof S)
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
	const getState = (): S => {
		const keys = Object.keys(state) as Array<keyof S>
		for (const key of keys) {
			state[key]
		}
		return state
	}
	const setState = (newState: Partial<S>) => {
		for (const key in newState) {
			state[key as keyof S] = newState[key as keyof S]!
			_notifyListeners(state, key as keyof S)
		}
	}
	const subscribe = (obj: object, listener: Subscription<S>, keys: Array<keyof S>): void => {
		_subscribeObject(obj, listener, keys)
	}

	const subscribeAll = (obj: object, listener: Subscription<S>): void => {
		const keys = Object.keys(state) as Array<keyof S>
		_subscribeObject(obj, listener, keys)
	}

	const unsubscribe = (obj: object): void => {
		if (!_checkSubscription(obj, true)) {
			return
		}
		_subscriberCallbacks.delete(obj)
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
