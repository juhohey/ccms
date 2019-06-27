import React from 'react'
import { propEq } from 'ramda'

import ImagePicker from '../image-picker'
import { Field, Label } from '../form/input'
import Enum from '../style/enum'
import CanHaveStyle, { CanHaveProp } from '../style/can-have-style'
import { Small } from '../elements'
import EditorComponent from '../wysiwyg'
import ELEMENTS from '../../../../cms/cms-components'

const renderProps = ({ element, props, children, onNextProps, onUpdateText, onUpdateSrc }) => {
  const elementName = element.name
  const elementConstant = ELEMENTS.LAYOUT.find(propEq('name', elementName))
  const possibleProps = elementConstant && elementConstant.possibleProps ? elementConstant.possibleProps : {}

  return <>
    <Small>Properties</Small>
    <CanHaveProp property='src' elementName={elementName}>
      <Field full>
        <ImagePicker
          onUpdate={onUpdateSrc}
          value={props.src}
          label='Source'
          isExternal={element.isExternal}
        />
      </Field>
    </CanHaveProp>
    <CanHaveStyle property='textContent' elementName={elementName}>
      <Label>Content</Label>
      <EditorComponent
        key={element.id}
        html={children || ''}
        onChange={e => onUpdateText(e)}
      />
    </CanHaveStyle>

    {Object.entries(possibleProps).map(([propName, prop]) => {
      return <CanHaveProp property={propName} elementName={elementName} key={propName + element.id}>
        <Enum
          title={propName.toUpperCase()}
          selected={prop.getCurrentValue(props)}
          options={prop.getValues(props)}
          onChange={value => onNextProps(prop.setNextProps(value, props))}
        />
      </CanHaveProp>
    })}
  </>
}

export default renderProps
