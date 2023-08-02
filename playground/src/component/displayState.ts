import { useBloc } from '@bloczone/core/src/bloczone'

const blocCounter = useBloc('COUNTER')

let state: HTMLElement
let callback: (newState: {count: number}) => void

export default class StateDisplayedElement extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = `
      .state {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background-color: #eee;
      }
    `

    state = document.createElement('div')
    state.className = 'state'
    state.textContent = `${blocCounter.state.value.count}`

    shadow.appendChild(style)
    shadow.appendChild(state)

    callback = (newState: {count: number}) => {
      state.textContent = `${newState.count}`
    }
  }

  connectedCallback() {
    console.log("connectedCallback called");
    blocCounter.manager.subscribe(blocCounter.state, 'value.count', callback)
  }


  disconnectedCallback() {
    if (blocCounter) {
      blocCounter.unsubscribe(blocCounter.state, 'value.count', callback)
    }
  }
}

customElements.define('state-displayed', StateDisplayedElement)
