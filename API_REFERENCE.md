
## API Reference

#### createEventEmitter()

Creates a new event emitter instance.

```js
  const eventEmitter = createEventEmitter();
```

No parameters required.

#### eventEmitter.on(event, handler)

Registers a new handler for the specified event.

```js
  eventEmitter.on('myEvent', (event, payload) => {
    console.log('myEvent triggered with payload:', payload);
  });
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `event`   | `string` | **Required**. The name of the event.  |
| `handler` | `function` | **Required**. The function to execute when the event is emitted. |

#### eventEmitter.off(event, handler)

Unregisters a handler from the specified event.

```js
  eventEmitter.off('myEvent', handler);
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `event`   | `string` | **Required**. The name of the event.  |
| `handler` | `function` | **Required**. The function to unregister from the event. |

#### eventEmitter.emit(event, payload)

Emits the specified event with the provided payload.

```js
  eventEmitter.emit('myEvent', { data: 'myData' });
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `event`   | `string` | **Required**. The name of the event.  |
| `payload` | `unknown` | The data to pass along with the event. |

#### createBlocZone(initialState)

Creates a new BlocZone instance.

```js
  const blocZone = createBlocZone({ key: 'value' });
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `initialState` | `object` | **Required**. The initial state of the BlocZone.  |

#### blocZone.getState()

Returns the current state of the BlocZone.

```js
  const currentState = blocZone.getState();
```

No parameters required.

#### blocZone.setState(newState)

Sets the state of the BlocZone.

```js
  blocZone.setState({ key: 'newValue' });
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `newState` | `object` | **Required**. The new state of the BlocZone.  |

#### blocZone.subscribe(obj, listener)

Subscribes the object to state updates.

```js
  blocZone.subscribe(myObj, (state) => {
    console.log('State updated:', state);
  });
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `obj`   | `object` | **Required**. The object to subscribe to state updates.  |
| `listener` | `function` | **Required**. The function to execute when the state updates. |

#### blocZone.unsubscribe(obj)

Unsubscribes the object from state updates.

```js
  blocZone.unsubscribe(myObj);
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `obj`   | `object` | **Required**. The object to unsubscribe from state updates.  |
