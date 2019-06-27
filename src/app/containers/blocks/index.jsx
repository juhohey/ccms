import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { push } from 'connected-react-router'

import { blocksAddBlock } from '../../modules/blocks'
import { LinkLike } from '../../components/link'
import { colors } from '../../theme'
import { Container } from '../../components/flex'
import { getId } from '../../../utils/id'

const List = styled.ul`
  list-style: none;
`
const ListItem = styled.li`
  margin-bottom: 16px;
`
const ListItemTitle = styled.span`
  font-size: 16px;
  color: ${colors.font._400};
  display: block;
`

const Blocks = ({ push, blocks, blocksAddBlock }) => {
  const addBlock = () => {
    const id = getId()
    blocksAddBlock({ id, name: 'MyBlock', content: [], locked: true })
    push(`/c/blocks/${id}`)
  }

  return <section>
    <Container>
      <h1>Blocks</h1>
      <List>
        {blocks.map((block, i) => (
          <ListItem key={block.id}>
            <ListItemTitle>{block.name}</ListItemTitle>
            <LinkLike onClick={e => push(`/c/blocks/${block.id}`)}>Editor</LinkLike>
          </ListItem>
        ))}
        <ListItem key={'new'}>
          <ListItemTitle>Add new</ListItemTitle>
          <LinkLike onClick={addBlock}>Add</LinkLike>
        </ListItem>
      </List>
    </Container>
  </section>
}

const mapStateToProps = (store) => ({
  blocks: store.blocks.content || []
})

const mapDispatchToProps = {
  push,
  blocksAddBlock
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Blocks)
