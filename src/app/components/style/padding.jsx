import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { assoc } from 'ramda'
import { Row, Flex } from '../flex'
import { Field } from '../form/input'
import { useDidMount } from '../../../utils/hooks'
import { css } from '../../theme'

const PaddingContainer = styled.div`

`
const Label = styled.label`
  text-align: center;
`
const FieldLabel = styled.label`
  display: inline-block;
  margin-right: 16px;
  width: 80%;
`
const PaddingInput = styled.input.attrs({ type: 'number' })`
  width: 60px;
`
const Options = styled.div`
  input {
    width: auto;
  }
`
const Box = styled.div`
  width: 100px;
  height: 100px; 
  background-color: #666;
  margin: 16px;
  ${css.cardLike}
`

const Padding = ({ path, padding = { top: 0, right: 0, left: 0, bottom: 0 }, setPadding }) => {
  const didMount = useDidMount()
  const [nextPadding, setNextPadding] = useState({ top: 0, right: 0, left: 0, bottom: 0 })
  const [useTopBottom, setUseTopBottom] = useState(padding.right === padding.left)
  const [useRightLeft, setUseRightLeft] = useState(padding.top === padding.bottom)
  const setPaddingField = (field, state) => e => {
    if ((field === 'left' && useRightLeft) || (field === 'right' && useRightLeft)) {
      const next = assoc('left', e.target.value, assoc('right', e.target.value, state))
      setNextPadding(next)
    } else if ((field === 'top' && useTopBottom) || (field === 'bottom' && useTopBottom)) {
      const next = assoc('top', e.target.value, assoc('bottom', e.target.value, state))
      setNextPadding(next)
    } else {
      setNextPadding(
        assoc(field, e.target.value, state)
      )
    }
  }

  useEffect(() => { if (didMount) setPadding(nextPadding) }, [nextPadding])
  useEffect(() => { setNextPadding(padding) }, [path])

  return <PaddingContainer>
    <h5>Padding</h5>
    <Flex align='center' justify='center'>
      <Flex>
        <Label>Top</Label>
        <PaddingInput value={nextPadding.top} onChange={setPaddingField('top', nextPadding)} />
      </Flex>
      <Row>
        <Flex align='center' justify='center'>
          <Label>Left</Label>
          <PaddingInput value={nextPadding.right} onChange={setPaddingField('right', nextPadding)} />
        </Flex>
        <Box />
        <Flex align='center' justify='center'>
          <Label>Right</Label>
          <PaddingInput value={nextPadding.left} onChange={setPaddingField('left', nextPadding)} />
        </Flex>
      </Row>
      <div>
        <Label>Bottom</Label>
        <PaddingInput value={nextPadding.bottom} onChange={setPaddingField('bottom', nextPadding)} />
      </div>
    </Flex>
    <Options>
      <Field>
        <FieldLabel>Share top/bottom values</FieldLabel>
        <input type='checkbox' checked={useTopBottom} onChange={e => setUseTopBottom(e.target.checked)} />
      </Field>
      <Field>
        <FieldLabel>Share left/right values</FieldLabel>
        <input type='checkbox' checked={useRightLeft} onChange={e => setUseRightLeft(e.target.checked)} />
      </Field>
    </Options>
  </PaddingContainer>
}

export default Padding
