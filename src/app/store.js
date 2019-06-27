import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'

import getRootReducer from './modules'

const initialState = {}
export const history = createBrowserHistory()

export default () => {
  const middleware = [thunk, routerMiddleware(history)]

  return createStore(
    getRootReducer(history),
    initialState,
    applyMiddleware(...middleware)
  )
}
