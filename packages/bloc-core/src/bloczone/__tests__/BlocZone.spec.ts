import { describe, test, expect, jest } from '@jest/globals'
import { createBlocZone } from '../BlocZone'
import type { Subscription } from '../../types'

describe('createBlocZone', () => {
  interface AppState {
    count: number
  }

  test('should initialize with the provided initial state', () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    expect(bloc.getState()).toEqual(initialState)
  })

  test('should update the state correctly when calling setState', () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    const newState: AppState = { count: 10 }
    bloc.setState(newState)

    expect(bloc.getState()).toEqual(newState)
  })

  test('should notify subscribers when the state changes', () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    let updatedState: AppState | null = null
    const subscriber: Subscription<AppState> = (state) => {
      updatedState = state
    }

    bloc.subscribe({}, subscriber)

    const newState: AppState = { count: 5 }
    bloc.setState(newState)

    expect(updatedState).toEqual(newState)
  })

  test('should unsubscribe without throwing an error', () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    const subscriber: Subscription<AppState> = () => {
      /* no-op */
    }

    const object = {}

    bloc.subscribe(object, subscriber)
    expect(() => {
      bloc.unsubscribe(object)
    }).not.toThrowError()
  })

  test('should warn when trying to unsubscribe an object that is not subscribed ', () => {
    const initialState: AppState = { count: 0 }
    const bloc = createBlocZone(initialState)

    const unknownObject = {}

		jest.spyOn(console, 'warn')

		bloc.unsubscribe(unknownObject)

		expect(console.warn).toHaveBeenCalledWith('Object is not subscribed to this Bloc')
  })
})
