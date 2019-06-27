import styled from 'styled-components'

export const Flex = styled.div`
  display: flex;
  flex-direction: column;
  ${({ justify, align }) => {
    let acc = ''
    if (justify) acc += `justify-content: ${justify};`
    if (align) acc += `align-items: ${align};`
    return acc
  }}
`
export const Row = styled(Flex)` 
  flex-flow: row ${({ wrap = true }) => wrap ? 'wrap' : ''};
  ${({ fill }) => fill ? 'height: 100%;' : ''};
`

export const Container = styled.div`
 ${({ position = '' }) => position ? `position: ${position};` : ''};
  width: 1275px;
  max-width: 100%;
  padding: 0 16px;
  margin: 0 auto;
`

export const Column = styled.div`
  padding: 0 16px;
`
