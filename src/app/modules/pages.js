import { assocPath, mergeDeepLeft, propEq, pick, dissocPath, findIndex } from 'ramda'
import { _delete, post, put, get } from '../actions/http-action'
import { HISTORY_EVENT_TYPES, historyAddEvent } from './history'

const PAGES_SET_STATE = 'PAGES_SET_STATE'
const PAGES_ADD_PAGE = 'PAGES_ADD_PAGE'
const PAGES_EDIT_PAGE = 'PAGES_EDIT_PAGE'
const PAGES_REMOVE_PAGE = 'PAGES_REMOVE_PAGE'

/**
 * @param {Array} pages
 * @param {Object} page ~ pages[n]
 * @param {String} page.id
 * @param {String} page.route
 * @param {String} page.name
 */

export const pagesSetState = state => ({ type: PAGES_SET_STATE, state })
export const pagesAddPage = page => (dispatch, getState) => {
  dispatch({ type: PAGES_ADD_PAGE, page })
  dispatch(historyAddEvent({ action: HISTORY_EVENT_TYPES.PAGES_CREATE, targetId: page.id }))
  savePagesSideEffect('put', page)
}
export const pagesEditPage = page => (dispatch, getState) => {
  dispatch({ type: PAGES_EDIT_PAGE, page })
  dispatch(historyAddEvent({ action: HISTORY_EVENT_TYPES.PAGES_EDIT, targetId: page.id }))
  savePagesSideEffect('post', pick(['route', 'name'], page), page.id)
}
export const pagesPublishPage = (nextPublishStatus) => (dispatch, getState) => {
  dispatch({ type: PAGES_EDIT_PAGE, page: nextPublishStatus })
  const historyAction = nextPublishStatus.isPublished
    ? HISTORY_EVENT_TYPES.PAGES_PUBLISH
    : HISTORY_EVENT_TYPES.PAGES_UNPUBLISH
  dispatch(historyAddEvent({ action: historyAction, targetId: nextPublishStatus.id }))
  pagesPublishSideEffect(nextPublishStatus, dispatch)
}
export const pagesRemovePage = (id) => (dispatch, getState) => {
  dispatch(({ type: PAGES_REMOVE_PAGE, id }))
  dispatch(historyAddEvent({ action: HISTORY_EVENT_TYPES.PAGES_DELETE, targetId: id }))
  savePagesSideEffect('delete', {}, id)
}

const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
    case PAGES_SET_STATE:
      return action.state
    case PAGES_EDIT_PAGE:
      const actionPage = action.page
      const idMatcher = propEq('id', actionPage.id)
      const editedPage = mergeDeepLeft(actionPage, state.find(idMatcher))
      const statePath = findIndex(idMatcher, state)
      const nextState = assocPath([statePath], editedPage, state)
      return nextState
    case PAGES_ADD_PAGE:
      return state.concat(action.page)
    case PAGES_REMOVE_PAGE:
      const removePageIdMatcher = propEq('id', action.id)
      const removePageStatePath = findIndex(removePageIdMatcher, state)
      return dissocPath([removePageStatePath], state)
    default:
      return state
  }
}

export const getPagesSideEffect = (dispatch) => {
  get({ url: '/pages' })
    .then(res => {
      return dispatch(pagesSetState(res))
    })
}
export const pagesPublishSideEffect = (body, dispatch) => {
  post({ url: `/pages/${body.id}/publish`, body })
    .then(res => {

    })
}

const savePagesSideEffect = (action, body, id) => {
  switch (action) {
    case 'put':
      return put({ url: '/pages', body })
        .then(res => console.info(res))

    case 'post':
      return post({ url: `/pages/${id}`, body })
        .then(res => console.info(res))

    case 'delete':
      return _delete({ url: `/pages/${id}`, body: {} })
        .then(res => console.info(res))
  }
}
