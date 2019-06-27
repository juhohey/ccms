import React from 'react'
import styled from 'styled-components'
import { dissoc, merge, equals } from 'ramda'

import { incrementChildPath } from '../../../utils/vdom'
import { css } from '../../theme'

const ElementContainer = styled.div`
  border: 2px dashed #dadada;
  position: relative;
  min-height: 100px;
  .h1{font-size:56px;line-height:1.35;letter-spacing:-.02em;margin:24px 0}
  .h1,h2{font-family:"Roboto","Helvetica","Arial",sans-serif;font-weight:400}
  .h2{font-size:45px;line-height:48px}h2,h3{margin:24px 0}h3{font-size:34px;line-height:40px}
  .h3,h4{font-family:"Roboto","Helvetica","Arial",sans-serif;font-weight:400}
  .h4{font-size:24px;line-height:32px;-moz-osx-font-smoothing:grayscale;margin:24px 0 16px}
  .h5{font-size:20px;font-weight:500;line-height:1;letter-spacing:.02em}
  .h5,h6{font-family:"Roboto","Helvxetica","Arial",sans-serif;margin:24px 0 16px}
  .h6{font-size:16px;letter-spacing:.04em}h6,p{font-weight:400;line-height:24px}
  .p{font-size:14px;letter-spacing:0;margin:0 0 16px}a{color:rgb(255,64,129);font-weight:500}
  padding: 12px;
  .section {
  }
  .container {
    max-width: 1200px;
    width: 100%;
  }
  .row {
    display: flex;
    flex-flow: row wrap;
  }
  .column {
  }
  cursor: pointer;
  ${({ isFocused }) => isFocused ? css.focused : ''}
`
const ElementImg = styled.img`
  ${({ isFocused }) => isFocused ? css.focused : ''}
`

const TextInput = styled.textarea` 
  border: 0;
  border-bottom: 1px dashed #444;
`
const AddElement = styled.div`

width: 100%;
  button {
    margin: 12px auto;
    display: block;
  }
`

// TODO: element.component means it's a custom component. Handle besides name matching
const h = (props, listeners) => {
  if (props.element.type === 'block') {
    return <ElementContainer key={props.id} className='block'>Block: {props.element.name}</ElementContainer>
  }
  if (props.component) {
    const nextListeners = merge(listeners, { onClick: e => listeners.onFocus(props.path), key: props.path + 'custom' })
    return React.createElement(props.component, merge(props.props, nextListeners), null)
  }
  const onFocus = e => listeners.onFocus(props.path)
  switch (props.element.name) {
    case 'title':
      return <TextElement key={props.path + 'h1'} {...props} {...listeners} type='h1' />
    case 'img':
      return <ElementImg
        src={props.props.src}
        className='img'
        isFocused={equals(props.focusedElementPath, props.path)}
        onClick={onFocus}
        key={props.path + 'img'}
        data-path={props.path}
      />
    case 'text':
      return <ElementContainer
        className='text'
        isFocused={equals(props.focusedElementPath, props.path)}
        onClick={onFocus} key={props.path + 'text'}
        {...dissoc('children', props)}
        data-path={props.path}
        dangerouslySetInnerHTML={{ __html: props.children[0] }}
      />

    default:
      return <Element key={props.path} {...props} {...listeners} />
  }
}

const TextElement = ({ props, type, children, onTextChange, path, onFocus }) => {
  return <TextInput
    {...props}
    className={type}
    onChange={e => { onTextChange(path, e.target.value) }}
    value={children}
    rows={1}
    onFocus={e => onFocus(path)}
  />
}
const getInitialClassName = (classNameInitial = '', elementName) => {
  const className = classNameInitial.includes(elementName)
    ? classNameInitial
    : classNameInitial.concat(` ${elementName}`).trim()
  return className
}

const Element = ({ element, props, children, path, onAddItem, onTextChange, onFocus, onRemoveItem, focusedElementPath }) => {
  const className = getInitialClassName(props.className, element.name)
  return <ElementContainer
    {...props}
    className={className}
    isFocused={equals(focusedElementPath, path)}
    data-path={path}
  >
    {children.map((child, i) => h(
      {
        ...child,
        path: incrementChildPath(path, i),
        focusedElementPath
      },
      {
        onAddItem,
        onTextChange,
        onFocus,
        onRemoveItem
      }
    ))}
  </ElementContainer>
}

export default h
