import React from 'react'

export default key => {
  return EN[key]
}

const EN = {
  'block.locked': <div>
    If locked:
    <ul>
      <li>The block cannot be edited in page templates</li>
      <li>Changes will update to templates</li>
      <li>If deleted, the block will be deleted from any page content as well</li>
    </ul>
  </div>,
  'disabled': '',
  'blocks.disabled': 'Blocks are disabled for this component.'
}
