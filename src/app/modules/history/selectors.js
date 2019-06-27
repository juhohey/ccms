import { HISTORY_EVENT_TYPES } from './index.js'

export const latestPublishEvent = (store) => store.history.current.find(({ targetId, action }) => (
  targetId === store.currentPage &&
  (action === HISTORY_EVENT_TYPES.PAGES_PUBLISH || action === HISTORY_EVENT_TYPES.PAGES_UNPUBLISH)
))
