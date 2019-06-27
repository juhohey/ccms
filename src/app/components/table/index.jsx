import React from 'react'
import styled from 'styled-components'

const TableElement = styled.table`
  table-layout: fixed;
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
  td, th{
    padding: 14px;
    vertical-align: top;
    border-bottom: 1px solid #dee2e6;
  }
  th {
    vertical-align: bottom;
    border-bottom: 2px solid #dee2e6;
    font-weight: bold;
    text-align: left;
  }
  tr: nth-child(even) {
    background: #f9f9f9;
  }
  ${({ css }) => css}
`

const Table = ({ header, items, css }) => {
  return <TableElement css={css}>
    <thead>
      <tr>
        {header.map(name => <th key={name}>{name}</th>)}
      </tr>
    </thead>
    <tbody>
      {items.map((row, i) => <tr key={i}>
        {row.map((cell, j) => <td key={j}>{cell}</td>)}
      </tr>)}
    </tbody>
  </TableElement>
}

export default Table
