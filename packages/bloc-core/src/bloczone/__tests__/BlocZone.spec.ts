import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { createBlocZone } from '../BlocZone'
import type { MiddlewareFunction, Subscription } from '../../types'

describe('createBlocZone', () => {
  interface AppState {
    count: number
  }

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {
      /* no-op */
    })
  })

  test('should initialize with the provided initial state', () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    expect(bloc.getState()).toEqual(initialState)
  })

  test('should update the state correctly when calling setState', async () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    const newState: Partial<AppState> = { count: 10 }
    await bloc.setState('countUpdate', newState)

    expect(bloc.getState()).toEqual({ ...initialState, ...newState })
  })

  test('should notify subscribers when the state changes', async () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    let updatedState: AppState | null = null
    const subscriber: Subscription<AppState> = (state) => {
      updatedState = state
    }

    const subscriptionObj = {}
    bloc.subscribe(subscriptionObj, subscriber, ['count'])

    const newState: Partial<AppState> = { count: 5 }
    await bloc.setState('countUpdate', newState)

    expect(updatedState).toEqual({ ...initialState, ...newState } as AppState)
  })

  test('should unsubscribe without throwing an error', () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    const subscriber: Subscription<AppState> = () => {
      /* no-op */
    }

    const subscriptionObj = {}

    bloc.subscribe(subscriptionObj, subscriber, ['count'])
    expect(() => {
      bloc.unsubscribe(subscriptionObj)
    }).not.toThrowError()
  })

  test('should warn when trying to unsubscribe an object that is not subscribed', () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    const unknownObject = {}

    jest.spyOn(console, 'warn')

    bloc.unsubscribe(unknownObject)

    expect(console.warn).toHaveBeenCalledWith(
      `The object you're trying to unsubscribe isn't currently subscribed to this Bloc: ${unknownObject}`
    )
  })

  test('should allow middleware to modify state updates', async () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)
    bloc.use('middleware')

    const modifyState: MiddlewareFunction<AppState> = async (_state, _action, args) => {
      if (args.length > 0) {
        const newState = args[0]
        newState.count = 5
      }
    }

    bloc.addMiddleware(modifyState)

    await bloc.setState('countUpdate', { count: 2 })

    expect(bloc.getState()).toEqual({ count: 5 })
  })

  test('should allow middleware to cancel state updates', async () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)
    bloc.use('middleware')

    const cancelState: MiddlewareFunction<AppState> = async () => {
      throw new Error('State update cancelled by middleware')
    }

    bloc.addMiddleware(cancelState)

    await expect(bloc.setState('countUpdate', { count: 2 })).rejects.toThrowError(
      'State update cancelled by middleware'
    )

    expect(bloc.getState()).toEqual({ count: 0 })
  })

  test('should allow multiple updates within a batchUpdate without notifying subscribers until the end', async () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    bloc.use('batchedUpdates')

    let updatedState: AppState | null = null
    const subscriber: Subscription<AppState> = (state) => {
      updatedState = state
    }

    bloc.subscribe({}, subscriber, ['count'])

    await bloc.addBatch(() => {
      bloc.setState('countUpdate', { count: 1 })
      bloc.setState('countUpdate', { count: 2 })
    })

    expect(updatedState).toEqual({ count: 2 })
  })
})
