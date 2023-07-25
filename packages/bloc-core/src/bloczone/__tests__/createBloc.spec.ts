import { describe, test, expect, jest } from '@jest/globals'
import { createBloc, useBloc } from '../createBloc'
import type { BlocZone } from '../../types'

describe('createBloc and useBloc', () => {
	test('should create a bloc with the provided initial state', () => {
		const blocId = 'testBloc'
		const initialState = { count: 0 }
		const bloc: BlocZone<typeof initialState> = createBloc(blocId, initialState)

		expect(bloc.getState()).toEqual(initialState)
	})

	test('should retrieve the correct bloc that was previously created', () => {
		const blocId = 'testBloc2'
		const initialState = { count: 0 }
		const createdBloc: BlocZone<typeof initialState> = createBloc(blocId, initialState)

		const retrievedBloc = useBloc(blocId)

		expect(retrievedBloc).toBe(createdBloc)
	})

	test('should undefined if the bloc does not exist', () => {
		const blocId = 'testBloc3'
		const retrievedBloc = useBloc(blocId)

		expect(retrievedBloc).toBeUndefined()
	})

	test('should create and retrieve the same bloc', () => {
		const blocId = 'testBloc1'

		const initialState = { count: 0 }
		const createdBloc: BlocZone<typeof initialState> = createBloc(blocId, initialState)

		const retrievedBloc = useBloc(blocId)

		expect(retrievedBloc).toBe(createdBloc)
	})

	test('should subscribe to the bloc and get called when state is updated', () => {
		const blocId = 'testBloc4'
		const initialState = { count: 0 }
		const bloc: BlocZone<typeof initialState> = createBloc(blocId, initialState)

		const subscriber = jest.fn()
		bloc.subscribe({}, subscriber, ['count'])

		const newState = { count: 1 }

		bloc.setState('countUpdate', newState)

		expect(subscriber).toHaveBeenCalledWith(newState)
	})

	test('should unsubscribe from the bloc and not get called when state is updated', () => {
		const blocId = 'testBloc5'

		const initialState = { count: 0 }
		const bloc: BlocZone<typeof initialState> = createBloc(blocId, initialState)

		const subscriber = jest.fn()
		bloc.subscribe(subscriber, (newState) => newState.count, ['count'])

		bloc.unsubscribe(subscriber)

		const newState = { count: 1 }

    bloc.setState('countUpdate', newState)

		expect(subscriber).not.toHaveBeenCalledWith(newState)
	})
})
