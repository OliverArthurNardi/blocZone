export type Subscription<S> = (state: S) => void
export type EventReceiver = (event: string, payload: any) => void
export type Dispatch = (event: string, payload: any) => void

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
  getRawState: () => S;
  /**
   * Returns the current state object.
   *
   * @returns {S} The current state object.
   */
  getState: () => S;
  /**
   * Sets the state object to the given value.
   *
   * @param {S} newState - The new state object.
   */
  setState: (state: S) => void;
  /**
   * Adds a listener function to the given object that will be called whenever the state changes.
   *
   * @param {object} obj - The object to observe.
   * @param {Subscription<S>} listener - The listener function to add.
   */
  subscribe: (obj: object, listener: Subscription<S>) => void;
  /**
   * Removes the listener function from the given object.
   *
   * @param {object} obj - The object to unobserve.
   */
  unsubscribe: (obj: object) => void;
}


export interface EventEmitterProps {
	/**
	 * Adds an event listener for the specified event.
	 *
	 * @param event The event name
	 * @param handler The event handler
	 * @returns void
	 *
	 */
	on: (event: string, handler: EventReceiver) => void
	/**
	 * Removes an event listener for the specified event.
	 *
	 * @param event The event name
	 * @param handler The event handler
	 * @returns void
	 *
	 */
	off: (event: string, handler: EventReceiver) => void
	/**
	 * Emits an event with the specified payload.
	 *
	 * @param event The event name
	 * @param payload The event payload
	 * @returns void
	 *
	 */
	emit: (event: string, payload: unknown) => void
}
