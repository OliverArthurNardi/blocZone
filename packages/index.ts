// in your app
import { createBlocZone, createEventEmitter } from './bloc-core/src'

const myBloc = createBlocZone({ count: 0 })

const eventEmitter = createEventEmitter()

eventEmitter.on('setState', (event, payload) => {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    myBloc.setState(payload)
  } else {
    console.error(`Payload for event 'setState' should be an object: `, payload)
  }
})

eventEmitter.emit('setState', { count: 1 }) // myBloc's state is now { count: 1 }
console.log(myBloc.getState()) // Logs { count: 1 }
