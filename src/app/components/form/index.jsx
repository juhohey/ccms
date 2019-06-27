import React, { useState } from 'react'
import { assoc } from 'ramda'
import styled from 'styled-components'

import { FieldInput } from './input'
import Button, { Actions, ActionsFirst } from '../button'
import Loader from '../loader'
import { css } from '../../theme'
import { post, get, put } from '../../actions/http-action' // eslint: disable
import { submitOnEnter } from '../../../utils/keyboard'

export const FormHeading = styled.h2`
  margin-bottom: 32px;
`
export const FormContainer = styled.form`
  background: #fafafa;
  width: 600px;
  padding: 0 16px 24px 16px;
  margin-top: 16px;
  ${css.cardLike}
`

export const FormComplete = ({
  fields,
  postUrl,
  onSuccessAction,
  onSuccessMessage,
  actionText,
  actionsLinks = null,
  title,
  httpCall = post
}) => {
  const [info, setInfo] = useState(
    Object.entries(fields).reduce(
      (acc, [fieldName, field]) => assoc(fieldName, field.value, acc), {}
    )
  )
  const [formState, setFormState] = useState('initial')
  const propertySetter = (fieldName) => e => setInfo(assoc(fieldName, e.target.value, info))
  const submit = async () => {
    setFormState('loading')
    try {
      await httpCall({ url: postUrl, body: info }, false)
      setFormState('success')
      onSuccessAction()
    } catch (error) {
      console.log(error)
      setFormState('error')
    }
  }

  const renderSuccess = () => {
    return <h6>{onSuccessMessage}</h6>
  }
  const renderFormBody = () => (
    <div>
      {
        Object.entries(info).map(([fieldName, fieldValue]) => (
          <FieldInput
            key={fieldName}
            value={fieldValue}
            type={fields[fieldName].type}
            label={fields[fieldName].label}
            onChange={propertySetter(fieldName)}
          >
            {fields[fieldName].description}
          </FieldInput>
        ))
      }
      {formState === 'error' ? <span>Error, please try again</span> : null}
      <Actions>
        <ActionsFirst>
          {actionsLinks}
        </ActionsFirst>
        {formState === 'loading'
          ? <Loader />
          : <Button type='button' onClick={submit}>{actionText}</Button>
        }
      </Actions>
    </div>
  )

  return <FormContainer onKeyDown={submitOnEnter(submit)}>
    <FormHeading>{title}</FormHeading>
    {formState === 'success' ? renderSuccess() : renderFormBody()}

  </FormContainer>
}

export const FormBody = ({
  fields,
  onChangeFields,
  title,
  blankStyle
}) => {
  const [info, setInfo] = useState(
    Object.entries(fields).reduce(
      (acc, [fieldName, field]) => assoc(fieldName, field.value, acc), {}
    )
  )
  const propertySetter = (fieldName) => e => {
    const next = assoc(fieldName, e.target.value, info)
    onChangeFields(next)
    setInfo(next)
  }
  const renderFormBody = () => (
    <div>
      {
        Object.entries(info).map(([fieldName, fieldValue]) => (
          <FieldInput
            key={fieldName}
            value={fieldValue}
            checked={fieldValue}
            type={fields[fieldName].type}
            label={fields[fieldName].label}
            onChange={propertySetter(fieldName)}
          >
            {fields[fieldName].description}
          </FieldInput>
        ))
      }
    </div>
  )

  return blankStyle
    ? <>
      <FormHeading>{title}</FormHeading>
      {renderFormBody()}
    </>
    : <FormContainer>
      <FormHeading>{title}</FormHeading>
      {renderFormBody()}
    </FormContainer>
}
