import type { Subscription, BlocZone, FeatureFlagsMap, MiddlewareFunction } from '../types'
import { FeatureFlagsEnum } from '../types'

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
  let updateInterval: NodeJS.Timeout | null = null
  let isProcessingQueue = false
  let isBatchingUpdates = false

  const updateQueue: Array<{ state: S; newState: Partial<S> }> = []

  const middlewares: MiddlewareFunction<S>[] = []

  const featureFlags: FeatureFlagsMap = {
    batchedUpdates: false,
    middleware: false
  }

  const use = (feature: string) => {
    const featureEnumValue = _validateFeatureEnumValue(feature)

    if (!featureEnumValue) {
      throw new Error(
        `Invalid feature: ${feature}. Must be one of ${Object.keys(FeatureFlagsEnum).join(', ')}`
      )
    }

    switch (featureEnumValue) {
      case FeatureFlagsEnum.BATCHED_UPDATES:
        featureFlags[featureEnumValue] = true
        if (!updateInterval) {
          // TODO: This should be configurable via arguments.
          // to allow user to set the update interval.
          updateInterval = setInterval(_processUpdateQueue, 500)
        }
        break
      case FeatureFlagsEnum.MIDDLEWARE:
        featureFlags[featureEnumValue] = true
        break
    }
  }

  const addMiddleware = (middleware: MiddlewareFunction<S>) => {
    middlewares.push(middleware)
  }

  const addBatch: (callback: () => void) => void = (callback) => {
    isBatchingUpdates = true
    callback()
    isBatchingUpdates = false

    // process update queue if not already processing
    if (!isProcessingQueue) {
      isProcessingQueue = true
      _processUpdateQueue()
    }
  }

  const _validateFeatureEnumValue = (feature: string): FeatureFlagsEnum | undefined => {
    return Object.values(FeatureFlagsEnum).find((featureEnumValue) => featureEnumValue === feature)
  }

  const _runMiddlewares = (action: string, ...args: unknown[]): Promise<void> => {
    let index = -1
    const run = (): Promise<void> => {
      index++
      const middleware = middlewares[index]
      if (!middleware) {
        return Promise.resolve()
      }
      return Promise.resolve(middleware(state, action, args as Partial<S>[], run)).catch((error) => Promise.reject(error))
    }
    return run()
  }

  const effect = (eff: () => void) => {
    activeEffect = eff
    eff()
    activeEffect = null
  }

  const _processUpdateQueue = () => {
    const updatesToProcess = updateQueue.slice()
    updateQueue.length = 0
    updatesToProcess.forEach((update) => {
      const { state, newState } = update
      Object.assign(state, newState)
      for (const key in newState) {
        _notifyListeners(state, key as keyof S)
      }
    })
    isProcessingQueue = false
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
      console.warn(
        `The object you're trying to unsubscribe isn't currently subscribed to this Bloc: ${obj}`
      )
    } else if (!shouldExist && exists) {
      console.warn(
        `The object you're trying to subscribe is already subscribed to this Bloc: ${obj}`
      )
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
      throw new Error(
        'State not found in originalStateMap. This error occurs when attempting to get the raw state before it has been initialized.'
      )
    }
    return rawState
  }
  const getState = (): S => {
    return state
  }
  const setState = async (action: string, ...args: unknown[]): Promise<void> => {
    if (featureFlags[FeatureFlagsEnum.MIDDLEWARE]) {
      await _runMiddlewares(action, ...args)
    }

    const newState = args[0] as Partial<S>

    if (featureFlags[FeatureFlagsEnum.BATCHED_UPDATES] && isBatchingUpdates) {
      updateQueue.push({ state: { ...state }, newState })
    } else if (updateQueue.length > 0 && !isProcessingQueue) {
      isProcessingQueue = true
      _processUpdateQueue()
    } else {
      Object.assign(state, newState)
      for (const key in newState) {
        _notifyListeners(state, key as keyof S)
      }
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
    unsubscribe,
    addMiddleware,
    addBatch,
    use
  }
}
