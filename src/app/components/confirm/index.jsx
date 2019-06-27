import React, { useState } from 'react'
import styled from 'styled-components'

import { Row } from '../flex'
import Dialog, { DialogTitle } from '../../components/dialog'
import Button from '../../components/button'

const ConfirmActions = styled(Row)`
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 16px;
  margin: 0;
`

const ConfirmButton = ({ label, action = 'delete', onConfirm, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false)
  const onClose = e => {
    setIsOpen(false)
    if (onCancel) {
      onCancel()
    }
  }
  const onConfirmAction = e => {
    onClose()
    onConfirm()
  }

  return <div>
    <Button action={action} onClick={e => setIsOpen(true)}>
      {label}
    </Button>
    <Dialog isOpen={isOpen} shouldRender={isOpen} onClose={onClose} type={'confirm'}>
      <section>
        <DialogTitle>Confirm {label}</DialogTitle>
        <ConfirmActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button action={action} onClick={onConfirmAction}>Confirm</Button>
        </ConfirmActions>
      </section>
    </Dialog>
  </div>
}

export default ConfirmButton
