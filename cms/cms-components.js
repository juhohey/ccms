import { assoc, assocPath } from 'ramda'

const removeClassLike = (removeTest, classNames) => classNames.split(' ').filter(className => !removeTest.test(className)).join(' ')

const COLUMN = {
  name: 'column',
  tag: 'div',
  getInitialProps: () => ({ className: 'column column-6 column-xs-12' }),
  possibleProps: {
    width: {
      getValues: (_) => ['1', '2', '3', '4', '5', '6', '7', '8', '10', '11', '12'],
      getCurrentValue: props => {
        const current = props.className.match(/column-\d{1,2}/)
        return current ? current[0].split('-').pop() : ''
      },
      setNextProps: (value, props) => {
        if (!value) {
          return assoc('className', removeClassLike(/column-\d{1,2}/, props.className), props)
        }
        const currentCleaned = removeClassLike(/column-\d/, props.className)
        return assoc('className', `${currentCleaned} column-${value}`, props)
      }
    },
    xsWidth: {
      getValues: (_) => ['1', '2', '3', '4', '5', '6', '7', '8', '10', '11', '12'],
      getCurrentValue: props => {
        const current = props.className.match(/column-xs-\d{1,2}/)
        return current ? current[0].split('-').pop() : ''
      },
      setNextProps: (value, props) => {
        if (!value) {
          return assoc('className', removeClassLike(/column-xs\d{1, 2}/, props.className), props)
        }
        const currentCleaned = removeClassLike(/column-xs-\d/, props.className)
        return assoc('className', `${currentCleaned} column-xs-${value}`, props)
      }
    }
  }
}

const ROW = {
  name: 'row',
  tag: 'div',
  possibleProps: {
    wrap: {
      getValues: (_) => ['yes', 'no'],
      getCurrentValue: props => props.wrap,
      setNextProps: (value, props) => assocPath(['props', 'wrap'], value, props)
    }
  }
}

const ELEMENTS = {
  LAYOUT: [
    { name: 'container', tag: 'div' },
    ROW,
    COLUMN,
    { name: 'article', tag: 'article' },
    { name: 'nav', tag: 'nav' },
    { name: 'section', tag: 'section' }
  ],
  TEXT: [
    // { name: 'title', tag: 'h1' },
    // { name: 'heading', tag: 'h1' },
    { name: 'text', tag: 'span' }
  ]
}

export default ELEMENTS
