export type EventMap = Record<string, unknown>
export type EventReceiver<T = unknown> = (payload: T) => void
export type Subscription<S> = (state: S) => void
export type Dispatch<P = unknown> = (event: string, payload: P) => void
export type Middleware<S> = (state: S, action: string, args: unknown[], next: () => void) => void
export type BlocId = string | symbol

/**
 * A generic interface for a state management object.
 *
 * @template S - The type of the state object.
 */
export interface BlocZone<S> {
	/**
	 * Returns the current raw state object.
	 *
	 * @returns {S} The current raw state object.
	 *
	 * @remarks
	 * The raw state object is the original state object that was passed to the Bloc instance.
	 * This is useful for comparing the current state to the initial state.
	 *
	 */
	getRawState: () => S
	/**
	 * Returns the current state object.
	 *
	 * @returns {S} The current state object.
	 */
	getState: () => S
	/**
	 * Sets the state object to the given value.
	 *
	 * @param {S} newState - The new state object.
	 */
	setState: (state: S) => void
	/**
	 * Adds a listener function to the given object that will be called whenever the state changes.
	 *
	 * @param {object} obj - The object to observe.
	 * @param {Subscription<S>} listener - The listener function to add.
	 */
	subscribe: (obj: object, listener: Subscription<S>) => void
	/**
	 * Removes the listener function from the given object.
	 *
	 * @param {object} obj - The object to unobserve.
	 */
	unsubscribe: (obj: object) => void
}

/**
 * An interface that provides a contract for adding, removing, and emitting events.
 *
 * @template E - The type of the events map.
 */
export interface EventEmitterProps<E> {
	/**
	 * Registers an event listener for the specified event.
	 *
	 * @template K A key within the event map E.
	 * @param {K} event The name of the event to listen for.
	 * @param {EventReceiver<E[K]>} handler The function to call when the event is emitted.
	 * @returns {void}
	 */
	on<K extends keyof E>(event: K, handler: EventReceiver<E[K]>): void
	/**
	 * Removes an event listener for the specified event.
	 *
	 * @template K A key within the event map E.
	 * @param {K} event The name of the event to stop listening for.
	 * @param {EventReceiver<E[K]>} handler The function to remove from the event's listeners.
	 * @returns {void}
	 */
	off<K extends keyof E>(event: K, handler: EventReceiver<E[K]>): void
	/**
	 * Emits an event, calling all listeners registered for this event and passing them the provided payload.
	 *
	 * @template K A key within the event map E.
	 * @param {K} event The name of the event to emit.
	 * @param {E[K]} payload The data to pass to the event listeners.
	 * @returns {void}
	 */
	emit<K extends keyof E>(event: K, payload: E[K]): void
}
