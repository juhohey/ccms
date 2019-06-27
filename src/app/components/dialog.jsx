import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Remove from './remove'

const DialogContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  overflow-x: scroll;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: rgba(48, 50, 62, 0.3);
  z-index: 10;
`

const Dialog = styled.dialog`
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  border-radius: 3px;
  padding: 0;
  border: 0;
  overflow-y: scroll;
  ${({ type }) => {
    switch (type) {
      case 'confirm':
        return `
          height: 120px;
          width: 240px;
          text-align: center;
       `
      case 'full':
        return `
        max-width: 90vw;
        max-height: 90vh;
        width: 90vw;
        height: 90vh;
      `
      default:
        return `
        min-height: 400px;
        max-height: 90vh;
        min-width: 800px;
        max-width: 90vw;
      `
    }
  }}
`
export const DialogTitle = styled.h5`
  margin: 0;
  padding: 28px 16px;
  background: #efefef;
`
export const DialogFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
`
export const DialogBody = styled.div`
  padding: 12px 16px 32px 16px;
`
const PORTAL_ROOT = document.querySelector('#portal-root')

export default ({ shouldRender = true, isOpen, onClose, children, type }) => {
  return shouldRender ? ReactDOM.createPortal(
    <DialogContainer>
      <Dialog open={isOpen} type={type}>
        <Remove onClick={onClose} />
        {children}
      </Dialog>
    </DialogContainer>,
    PORTAL_ROOT
  ) : null
}
