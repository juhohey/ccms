import React from 'react'
import { FieldInput } from '../form/input'
import { getFieldUpdater } from '../../../utils/functions'
import ClassSelect from '../class-select'

const renderCommonProps = ({ props, onUpdateProps, key }) => {
  const updateField = getFieldUpdater(onUpdateProps)
  const onChangeClass = nextClasses => onUpdateProps({ value: nextClasses, field: 'className' })
  return <>
    <ClassSelect key={key} className={props.className} onChange={onChangeClass} />
    <FieldInput
      label={'id'}
      value={props.id || ''}
      onChange={updateField('id', true)}
    />
  </>
}

export default renderCommonProps
