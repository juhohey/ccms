import React from 'react'
import styled from 'styled-components'
import { Row } from '../flex'
import { colors } from '../../theme'

export const Field = styled.div`
  margin-bottom: 12px;
  ${({ full }) => full ? 'width: 100%;' : ''}
`

export const Label = styled.label`
`

export const Input = styled.input`

`
const Slash = styled.div`
color: ${colors.lightBlue._400};
  padding: 0 4px;
  line-height: 1;
    font-size: 22px;
`

export const FieldInput = ({ value, type = 'text', label, onChange, id, children, ...rest }) => {
  return <Field>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} value={value} type={type} onChange={onChange} {...rest} />
    {children}
  </Field>
}

export const RouteInput = ({ value, onChange, label = 'Route' }) => {
  return <Field>
    <Label>{label}</Label>
    <Row wrap={0} align='center'>
      <Slash>/</Slash>
      <Input value={value} onChange={onChange} />
    </Row>
  </Field>
}
