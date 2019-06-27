import { propEq, compose, not, assoc } from 'ramda'
import { _delete, post, put, get } from '../actions/http-action'
import { showSnack } from '../../utils/snackbar'

const BLOCKS_SET_STATE = 'BLOCKS_SET_STATE'
const BLOCKS_SET_STATUS = 'BLOCKS_SET_STATUS'
const BLOCKS_ADD_BLOCK = 'BLOCKS_ADD_BLOCK'
const BLOCKS_DELETE_BLOCK = 'BLOCKS_DELETE_BLOCK'

// /**
//  * @param {Array} pages
//  * @param {Object} page ~ pages[n]
//  * @param {String} page.id
//  * @param {String} page.route
//  * @param {String} page.name
//  */
export const blockSetState = state => ({ type: BLOCKS_SET_STATE, state })
export const blocksAddBlock = block => dispatch => {
  action('put', block)
  dispatch({ type: BLOCKS_ADD_BLOCK, block })
}
export const blocksDeleteBlock = blockId => dispatch => {
  action('delete', {}, blockId, e => dispatch({ type: BLOCKS_DELETE_BLOCK, id: blockId }))
}
export const blocksSetStatus = status => ({ type: BLOCKS_SET_STATUS, status })

const initialState = { content: [], status: 'initial' }

export default (state = initialState, action) => {
  switch (action.type) {
    case BLOCKS_SET_STATUS:
      return assoc('status', action.status, state)

    case BLOCKS_DELETE_BLOCK:
      const content = state.content.filter(filterValueNot('id', action.id))
      return assoc('content', content, state)

    case BLOCKS_SET_STATE:
      return assoc('content', action.state, state)

    case BLOCKS_ADD_BLOCK:
      return assoc('content', state.content.concat(action.block), state)
    default:
      return state
  }
}

export const blocksGetsideEffect = (dispatch) => {
  dispatch(blocksSetStatus('loading'))
  action('get')
    .then(res => {
      dispatch(blockSetState(res))
      dispatch(blocksSetStatus('success'))
    })
    .catch(e => {
      dispatch(blocksSetStatus('error'))
      showSnack(e)
    })
}

const action = (action, body, id, callback) => {
  switch (action) {
    case 'put':
      return put({ url: '/blocks', body })
        .catch(showSnack)

    case 'post':
      return post({ url: `/blocks/${id}`, body })
        .catch(showSnack)

    case 'delete':
      return _delete({ url: `/blocks/${id}`, body: {} })
        .then(callback)
        .catch(showSnack)

    case 'get':
      return get({ url: `/blocks` }, true)
        .catch(showSnack)
  }
}

const filterValueNot = (key, value) => compose(not, propEq(key, value))
