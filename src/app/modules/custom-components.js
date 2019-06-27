import { assoc, assocPath, path, propEq } from 'ramda'
import { get } from '../actions/http-action'

const LOAD_CUSTOM_COMPONENTS = 'LOAD_CUSTOM_COMPONENTS'

export const customComponentsLoad = (custom) => ({ type: LOAD_CUSTOM_COMPONENTS, custom })

const initialState = {}
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_CUSTOM_COMPONENTS:
      return action.custom
    default:
      return state
  }
}

export const customGetSideEffect = (dispatch) => {
  get({ url: '/custom' })
    .then(({ custom }) => {
      const customComponents = custom.map(path => ({
        path,
        name: path.split('.').shift(),
        component: require(`../../../cms/components/${path}`).default
      }))
      return dispatch(customComponentsLoad(customComponents))
    })
}
