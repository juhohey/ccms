import React from 'react'
import styled from 'styled-components'
import { equals } from 'ramda'
import { Droppable, Draggable } from 'react-drag-and-drop'

import { onClickPathHandler } from '../../../utils/dom'
import { incrementChildPath } from '../../../utils/vdom'
import Icon from '../icon'

const TreeElementContainer = styled.div`
  border: 1px solid #ddd;
  background: #eee;
  padding: 12px 8px;
  cursor: pointer;
  .over {background: tomato;}
`
const TreeElementName = styled.span`
  padding-bottom: 6px;
  display: inline-block;
`

const areArrayValuesContained = (values, source) => values.filter((value, i) => source[i] === value).length === values.length

const getTreeElementName = (element, { className, id }) => {
  const printableId = id ? <i>#{id}</i> : ''
  const printableClassName = className ? <i>.{className}</i> : ''
  return <TreeElementName>{element.name}{printableId}{printableClassName}</TreeElementName>
}

const TreeElement = ({ element, props, children, path, onAddItem, onFocus, onClick, pageMoveItem }) => {
  if (element.type === 'block') {
    return <TreeElementContainer onClick={onClick} data-path={path}>Block: {element.name}</TreeElementContainer>
  }
  const hasChildren = children.length
  const hasNodeChildren = hasChildren && typeof children[0] !== 'string'

  const renderInBetweenDropZone = (path, i) => {
    return <Droppable types={['element']}
      onDrop={dropTarget => {
        const to = path.concat(['children'])
        const from = JSON.parse(dropTarget.element)
        if (equals(from, path) || areArrayValuesContained(from, to)) { return }
        pageMoveItem({ from, to, toIndex: i + 1 })
      }}
    ><Icon name={'drag_indicator'} /></Droppable>
  }
  return <TreeElementContainer data-path={path} onClick={onClick}>
    <Droppable types={['element']} onDrop={dropTarget => {
      const to = path.concat('children')
      const from = JSON.parse(dropTarget.element)
      if (equals(from, path) || areArrayValuesContained(from, to)) { return }
      pageMoveItem({ from, to, toIndex: 0 })
    }}>
      {path.length === 1 ? <span>{getTreeElementName(element, props)}<br /></span>
        : <Draggable type='element' data={JSON.stringify(path)}>
          <Icon name={'drag_handle'} /> {getTreeElementName(element, props)}<br />
        </Draggable>}
    </Droppable>

    {hasChildren
      ? hasNodeChildren
        ? children.map((child, i) => <div key={path + i}>
          <TreeElement
            {...child}
            data-path={path}
            path={incrementChildPath(path, i)}
            onFocus={onFocus}
            pageMoveItem={pageMoveItem}
          />
          {children[i + 1] ? renderInBetweenDropZone(path, i) : null}
        </div>)
        : `"${children}"`
      : null
    }
  </TreeElementContainer>
}

const Tree = ({ content, editorSetFocus, pageMoveItem }) => {
  return <section>
    { content.map((section, i) => (
      <TreeElement
        onClick={onClickPathHandler(editorSetFocus)}
        {...section}
        path={[i]}
        key={i}
        pageMoveItem={pageMoveItem}
      />
    )) }
  </section>
}

export default Tree
