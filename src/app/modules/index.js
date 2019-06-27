import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import layout from './layout'
import pages from './pages'
import editor from './editor'
import currentPage from './currentpage'
import env from './env'
import history from './history'
import custom from './custom-components'
import blocks from './blocks'

export default routerHistory => combineReducers({
  layout,
  pages,
  currentPage,
  editor,
  env,
  history,
  custom,
  blocks,
  router: connectRouter(routerHistory)
})
