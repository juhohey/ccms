import React from 'react'
import styled from 'styled-components'
import { Flex } from '../flex'

const Container = styled.div`
  margin-bottom: 16px;
`
const Label = styled.label`
  text-align: center;
`

const Padding = ({ options, title, selected, onChange }) => {
  return <Container className='style-enum'>
    <Flex align='flex-start' justify='flex-start'>
      <Label>{title}</Label>
      <select value={selected} onChange={e => onChange(e.target.value)}>
        <option key={'novalue'} value=''>No value</option>
        {options.map(option => <option key={title + '-' + option}>{option}</option>)}
      </select>
    </Flex>
  </Container>
}

export default Padding
