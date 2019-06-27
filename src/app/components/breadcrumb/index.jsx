import React from 'react'
import styled from 'styled-components'
import { Container, Row } from '../flex'
import { colors } from '../../theme'
import { Link } from 'react-router-dom'
import Icon from '../icon'

const BreadcrumbContainer = styled.section`
  padding: 8px;
  width: 100%;
  background: #c1c1c1;
  border-bottom: 1px solid #b1b1b1;
  padding: 12px 24px;
`
export const BreadcrumbHeading = styled.span`
  margin: 0 22px 0 0;
`
const Content = styled.div`

`
const BreadcrumbPrevious = styled.div`

`
const BreadcrumbSpacer = styled.span`
  margin: 0 20px;
  color: ${colors.font._300};
  font-size: 12px;
`
export const BreadcrumbLast = styled.div`
  margin-left: auto;
`

const Breadcrumb = ({ children, previous, currentName }) => {
  return <BreadcrumbContainer>
    <Content>
      <Row align='center'>
        {previous.map((item, i) => {
          return <Row key={item.to}>
            <BreadcrumbPrevious>
              <Link to={item.to}>{item.label}</Link>
            </BreadcrumbPrevious>
            <BreadcrumbSpacer>
              <Icon name={'keyboard_arrow_right'} size={'16px'} />
            </BreadcrumbSpacer>
          </Row>
        })}
        <BreadcrumbHeading>
          {currentName}
        </BreadcrumbHeading>
        {children}
      </Row>
    </Content>
  </BreadcrumbContainer>
}

export default Breadcrumb
