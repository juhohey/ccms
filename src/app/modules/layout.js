import { assoc, assocPath, path, clone, dissocPath } from 'ramda'
import { createMatchSelector } from 'connected-react-router'
import { editorSetFocus } from './editor'
import { post, get } from '../actions/http-action'
import { currentPageSet } from './currentpage'
import { showSnackError } from '../../utils/snackbar'
import { getNode } from '../../utils/vdom'

const ADD_ITEM = 'ADD_ITEM'
const ADD_SECTION = 'ADD_SECTION'
const UPDATE_PROPS = 'UPDATE_PROPS'
const PAGE_SET_TEXT = 'PAGE_SET_TEXT'
const PAGE_SET_STATE = 'PAGE_SET_STATE'
const PAGE_REMOVE_ITEM = 'PAGE_REMOVE_ITEM'
const PAGE_SAVE_LOADING = 'PAGE_SAVE_LOADING'
const PAGE_SAVE_SUCCESS = 'PAGE_SAVE_SUCCESS'
const PAGE_SAVE_ERROR = 'PAGE_SAVE_ERROR'
const PAGE_MOVE_ITEM = 'PAGE_MOVE_ITEM'

const pageSetState = state => ({ type: PAGE_SET_STATE, state })
export const getPageIdFromRouter = state => createMatchSelector('/c/pages/:id/page')(state).params.id

export const pageAddSection = params => (dispatch, getState) => {
  dispatch(pageAddSectionAction(params))
  const compoundedPath = [getState().layout.content.length - 1]
  dispatch(editorSetFocus(compoundedPath))

  savePageSideEffect(getState(), dispatch)
}
const pageAddSectionAction = () => ({ type: ADD_SECTION })
export const pageSave = () => (dispatch, getState) => {
  savePageSideEffect(getState(), dispatch)
}

/**
 *
 * @param {Object} params
 * @param {Array} params.path to target - now a number of section
 * @param {String} params.item
 */
export const pageAddItem = params => (dispatch, getState) => {
  dispatch(pageAddItemAction(params))
  const compoundedPath = params.path.concat([
    'children',
    path(params.path, getState().layout.content).children.length - 1
  ])

  dispatch(editorSetFocus(compoundedPath))
  savePageSideEffect(getState(), dispatch)
}
const pageAddItemAction = (params) => ({ type: ADD_ITEM, params })
/**
 *
 * @param {Object} params
 * @param {Array} params.path to target - now a number of section
 * @param {String} params.item
 */
export const pageRemoveItem = path => (dispatch, getState) => {
  dispatch(({ type: PAGE_REMOVE_ITEM, path }))
  dispatch(editorSetFocus([null]))
  savePageSideEffect(getState(), dispatch)
}

/**
 * @param {Object} params
 * @param {Array} params.path to target
 * @param {String} params.propName
 * @param {any} params.value
 */
export const pageUpdateProps = (params) => ({ type: UPDATE_PROPS, params })
export const pageSetText = (params) => ({ type: PAGE_SET_TEXT, params })
export const pageGetPage = pageId => dispatch => getPageSideEffect(pageId, dispatch)
/** {from: Array, to: Array, toIndex: integer} */
export const pageMoveItem = (params) => ({ type: PAGE_MOVE_ITEM, params })

const initialState = { content: [], status: 'initial' }

export default (state = initialState, action) => {
  switch (action.type) {
    case PAGE_SET_STATE:
      return { content: action.state, status: 'initial' }
    case ADD_SECTION:
      return { ...state, content: state.content.concat(getNode({ name: 'section', tag: 'section' })) }
    case UPDATE_PROPS:
      const next = assocPath(
        action.params.path,
        action.params.value,
        state.content
      )
      return { ...state, content: next }
    case PAGE_REMOVE_ITEM:
      return {
        ...state,
        content: dissocPath(action.path, state.content)
      }

    case PAGE_SET_TEXT:
      const textSection = path(action.params.path, state.content)
      const nextTextSection = { ...textSection, children: [action.params.text] }
      return {
        ...state,
        content: assocPath(
          action.params.path,
          nextTextSection,
          state.content
        )
      }
    case ADD_ITEM:
      const section = path(action.params.path, state.content)
      const nextSection = { ...section, children: section.children.concat(action.params.item) }
      return {
        ...state,
        content: assocPath(
          action.params.path,
          nextSection,
          state.content
        )
      }
    case PAGE_MOVE_ITEM:
      // TODO: fix complex logic
      const content = state.content
      const originalFromItemId = path(action.params.from, content).id
      const cutItem = path(action.params.from, content)
      const existingChildren = path(action.params.to, content) // maybe there's no children array yet
      existingChildren.splice(action.params.toIndex, 0, cutItem)
      const pasteState = assocPath(action.params.to, clone(existingChildren), content)
      const shouldUpdateFrom = path(action.params.from, content).id !== originalFromItemId
      if (shouldUpdateFrom) {
        action.params.from[action.params.to.length] = action.params.from[action.params.to.length] + 1
        return {
          ...state,
          content: dissocPath(action.params.from, pasteState)
        }
      }
      const finalState = dissocPath(action.params.from, pasteState)
      return {
        ...state,
        content: finalState
      }
    case PAGE_SAVE_SUCCESS:
      return {
        ...state,
        status: 'success'
      }
    case PAGE_SAVE_LOADING:
      return {
        ...state,
        status: 'loading'
      }
    case PAGE_SAVE_ERROR:
      return {
        ...state,
        status: 'error',
        error: action.error
      }
    default:
      return state
  }
}

export const savePageSideEffect = (state, dispatch) => {
  dispatch({ type: PAGE_SAVE_LOADING })
  const pageId = getPageIdFromRouter(state)
  const layout = state.layout
  post({ url: `/layout/${pageId}/update`, body: { content: layout.content } })
    .then(res => {
      dispatch({ type: PAGE_SAVE_SUCCESS })
    })
    .catch(showSnackError('history'))
    .catch(error => {
      showSnackError('Failed to save page')(error)
      dispatch({ type: PAGE_SAVE_ERROR, error })
    })
}

export const getPageSideEffect = (pageId, dispatch) => {
  get({ url: `/layout/${pageId}` })
    .then((layout) => {
      return layout
    })
    .catch(showSnackError('Failed to load layout'))
    .then(layout => {
      dispatch(currentPageSet(layout.page))
      return mapCustomComponents(layout.content)
    })
    .then(layout => {
      dispatch(pageSetState(layout))
      dispatch(editorSetFocus([0]))
    })
}

const mapCustomComponents = async layout => {
  let mappedElements = []
  for (let i = 0; i < layout.length; i++) {
    let element = layout[i]
    // Custom componetn child
    if (element.element && element.element.custom) {
      const loadedComponent = await require(`../../../cms/components/${element.element.custom.path}`)

      element = assoc('component', loadedComponent.default, element)
    }
    // Children && children are components, not string
    if (element.children && Array.isArray(element.children)) {
      element.children = await mapCustomComponents(element.children)
    }
    mappedElements = mappedElements.concat(element)
  }
  return mappedElements
}
