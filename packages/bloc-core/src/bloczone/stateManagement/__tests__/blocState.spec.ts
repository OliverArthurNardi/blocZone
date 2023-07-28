import { describe, test, expect, jest } from '@jest/globals'

import createBlocState from '../blocState'

describe('createBlocState', () => {
  test('throws error for non-object initial state', () => {
    // @ts-expect-error - Testing invalid input
    expect(() => createBlocState(null)).toThrow('Bloc state must be an object')
    // @ts-expect-error - Testing invalid input
    expect(() => createBlocState(undefined)).toThrow('Bloc state must be an object')
    // @ts-expect-error - Testing invalid input
    expect(() => createBlocState(5)).toThrow('Bloc state must be an object')
    // @ts-expect-error - Testing invalid input
    expect(() => createBlocState('hello')).toThrow('Bloc state must be an object')
  })

  test('does not throw error for object initial state', () => {
    const initialState = { value: 1 }
    expect(() => createBlocState(initialState)).not.toThrow()
  })

  test('should get and set values', () => {
    const initialState = { value: 1 }
    const bloc = createBlocState(initialState)
    expect(bloc.value).toEqual(1)
    bloc.value = 2
    expect(bloc.value).toEqual(2)
  })

  test('should not notify listeners on set if value is unchanged', () => {
    const initialState = { value: 1 }
    const bloc = createBlocState(initialState)
    const listener = jest.fn()
    const effect = () => {
      bloc.value
      listener()
    }
    effect()
    bloc.value = 1
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
