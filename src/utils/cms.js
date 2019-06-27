import { isString } from './string'
import { assoc, propEq, head } from 'ramda'
import { pass } from './functions'

/*
  * TODO: blocksCascadeOnDelete
  */
const removeChildrenIfNotExists = layout => layout.reduce((acc, next) => {
  if (!next) {
    return acc
  }
  if (!acc.children) {
    return acc.concat(next)
  } else {
    const nextWithChildren = assoc('children', removeChildrenIfNotExists(next.children), next)
    return acc.concat(nextWithChildren)
  }
}, [])

export const mapBlocksToContent = (layout, blocks) => removeChildrenIfNotExists(layout.map(item => {
  if (isString(item)) {
    return item
  } else if (item.element.type === 'block') {
    const block = blocks.find(propEq('id', item.element.blockId))
    /*
    * TODO: blocksCascadeOnDelete
    * On block deletion block is not removed from the template - here we can assume it doesn't exist
    */
    if (!block) {
      return null
    }
    return head(block.content)
  } else {
    return assoc('children', mapBlocksToContent(item.children, blocks), item)
  }
}))

export const removeEmptyBlocks = (layout, blocks) => removeChildrenIfNotExists(layout.map(item => {
  if (isString(item)) {
    return item
  } else if (item.element.type === 'block') {
    const block = blocks.find(propEq('id', item.element.blockId))
    return block ? item : null
  } else {
    return assoc('children', removeChildrenIfNotExists(item.children, blocks), item)
  }
}))

export const getBlockIdsFromContent = (layout) => layout.map(item => {
  if (isString(item)) {
    return null
  } else if (item.element.type === 'block') {
    return item.element.blockId
  } else {
    return item.children ? getBlockIdsFromContent(item.children) : null
  }
}).filter(pass)
