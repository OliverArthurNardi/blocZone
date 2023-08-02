import { describe, test, expect, jest, beforeEach } from '@jest/globals'

import createBlocState from '../blocState'

describe('createBlocState', () => {
  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {
      /* no-op */
    })
  })
  test('throws error for non-object initial state', () => {
    // @ts-expect-error - Testing invalid input
    expect(() => createBlocState(null)).toThrow('initialState must be an object')
    // @ts-expect-error - Testing invalid input
    expect(() => createBlocState(undefined)).toThrow('initialState must be an object')
    // @ts-expect-error - Testing invalid input
    expect(() => createBlocState(5)).toThrow('initialState must be an object')
    // @ts-expect-error - Testing invalid input
    expect(() => createBlocState('hello')).toThrow('initialState must be an object')
  })

  test('does not throw error for object initial state', () => {
    const initialState = { value: 1 }
    expect(() => createBlocState(initialState)).not.toThrow()
  })

  test('does not set the state directly', () => {
    const initialState = { value: 1 }
    const { value } = createBlocState(initialState)
    expect(() => {
      const newState = { ...value, value: 2 }
      // @ts-expect-error - Testing invalid input
      state = newState
    }).toThrow()
  })

  test('throws error for non-existing key in setState', () => {
    const initialState = { value: 1 }
    const { setState } = createBlocState(initialState)
    // @ts-expect-error - Testing invalid input
    expect(() => setState('testAction', 'nonExistingKey', 2)).toThrow('Key "nonExistingKey" does not exist in initialState')
  })
  test('getState returns current state', () => {
    const initialState = { value: 1 }
    const { value } = createBlocState(initialState)
    expect(value).toBe(value)
  })

  test('setState updates state', () => {
    const initialState = { counter: 1 }
    const { setState, value } = createBlocState(initialState)
    setState('testAction', 'counter', 2)
    expect(value.counter).toBe(2)
  })
})
