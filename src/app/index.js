import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import App from './containers/app'
import { getPagesSideEffect } from './modules/pages'
import configureStore, { history } from './store'
import './css/main.css'
import 'node-snackbar/dist/snackbar.min.css'
import { envGetSideEffect } from './modules/env'
import { historyGetSideEffect } from './modules/history'
import { customGetSideEffect } from './modules/custom-components'
import { blocksGetsideEffect } from './modules/blocks'
const store = configureStore()

const ROOT = document.querySelector('#root')
getPagesSideEffect(store.dispatch)
envGetSideEffect(store.dispatch)
historyGetSideEffect(store.dispatch)
customGetSideEffect(store.dispatch)
blocksGetsideEffect(store.dispatch)

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  ROOT
)
