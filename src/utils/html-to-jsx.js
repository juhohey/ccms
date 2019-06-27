// From https://github.com/littlehaker/html-to-jsx

/**
  The MIT License (MIT)

  Copyright (c) 2014 Young

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

var attrs = [
  'accept',
  'acceptCharset',
  'accessKey',
  'action',
  'allowFullScreen',
  'allowTransparency',
  'alt',
  'async',
  'autoComplete',
  'autoFocus',
  'autoPlay',
  'capture',
  'cellPadding',
  'cellSpacing',
  'charSet',
  'challenge',
  'checked',
  'classID',
  'className',
  'cols',
  'colSpan',
  'content',
  'contentEditable',
  'contextMenu',
  'controls',
  'coords',
  'crossOrigin',
  'data',
  'dateTime',
  'defer',
  'dir',
  'disabled',
  'download',
  'draggable',
  'encType',
  'form',
  'formAction',
  'formEncType',
  'formMethod',
  'formNoValidate',
  'formTarget',
  'frameBorder',
  'headers',
  'height',
  'hidden',
  'high',
  'href',
  'hrefLang',
  'htmlFor',
  'httpEquiv',
  'icon',
  'id',
  'inputMode',
  'keyParams',
  'keyType',
  'label',
  'lang',
  'list',
  'loop',
  'low',
  'manifest',
  'marginHeight',
  'marginWidth',
  'max',
  'maxLength',
  'media',
  'mediaGroup',
  'method',
  'min',
  'minLength',
  'multiple',
  'muted',
  'name',
  'noValidate',
  'open',
  'optimum',
  'pattern',
  'placeholder',
  'poster',
  'preload',
  'radioGroup',
  'readOnly',
  'rel',
  'required',
  'role',
  'rows',
  'rowSpan',
  'sandbox',
  'scope',
  'scoped',
  'scrolling',
  'seamless',
  'selected',
  'shape',
  'size',
  'sizes',
  'span',
  'spellCheck',
  'src',
  'srcDoc',
  'srcSet',
  'start',
  'step',
  'style',
  'summary',
  'tabIndex',
  'target',
  'title',
  'type',
  'useMap',
  'value',
  'width',
  'wmode',
  'wrap'
]

export default function convert (html) {
  html = html
    .replace(/\sclass=/g, ' className=')
    .replace(/\sfor=/g, ' htmlFor=')
    // replace comments
    .replace(/<!--/g, '{/*')
    .replace(/-->/g, '*/}');

  [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ].forEach(function (tag) {
    var regex = new RegExp('<(' + tag + '[^/]*?)>', 'g')
    html = html
      .replace(regex, function (_, str) {
        return '<' + str + '/>'
      })
  })

  // replace attrNames
  attrs.forEach(function (attr) {
    var origin_attr = attr.toLowerCase()
    var regex = new RegExp('\\s' + origin_attr + '=', 'g')
    html = html.replace(regex, ' ' + attr + '=')
  })

  // replace styles
  html = html.replace(/\sstyle="(.+?)"/g, function (attr, styles) {
    var jsxStyles = new StyleParser(styles).toJSXString()
    return ' style={{' + jsxStyles + '}}'
  })
  return html
}

// Codes below are copied from Facebook's html to jsx module.

/**
 * Convert a hyphenated string to camelCase.
 */
function hyphenToCamelCase (string) {
  return string.replace(/-(.)/g, function (match, chr) {
    return chr.toUpperCase()
  })
}

/**
 * Determines if the specified string consists entirely of numeric characters.
 */
function isNumeric (input) {
  return input !== undefined &&
    input !== null &&
    (typeof input === 'number' || parseInt(input, 10) == input)
}

/**
 * Handles parsing of inline styles
 *
 * @param {string} rawStyle Raw style attribute
 * @constructor
 */
var StyleParser = function (rawStyle) {
  this.parse(rawStyle)
}
StyleParser.prototype = {
  /**
   * Parse the specified inline style attribute value
   * @param {string} rawStyle Raw style attribute
   */
  parse: function (rawStyle) {
    this.styles = {}
    rawStyle.split(';').forEach(function (style) {
      style = style.trim()
      var firstColon = style.indexOf(':')
      var key = style.substr(0, firstColon)
      var value = style.substr(firstColon + 1).trim()
      if (key !== '') {
        this.styles[key] = value
      }
    }, this)
  },

  /**
   * Convert the style information represented by this parser into a JSX
   * string
   *
   * @return {string}
   */
  toJSXString: function () {
    var output = []
    for (var key in this.styles) {
      if (!this.styles.hasOwnProperty(key)) {
        continue
      }
      output.push(this.toJSXKey(key) + ': ' + this.toJSXValue(this.styles[key]))
    }
    return output.join(', ')
  },

  /**
   * Convert the CSS style key to a JSX style key
   *
   * @param {string} key CSS style key
   * @return {string} JSX style key
   */
  toJSXKey: function (key) {
    return hyphenToCamelCase(key)
  },

  /**
   * Convert the CSS style value to a JSX style value
   *
   * @param {string} value CSS style value
   * @return {string} JSX style value
   */
  toJSXValue: function (value) {
    if (isNumeric(value)) {
      // If numeric, no quotes
      return value
    } else {
      // Proably a string, wrap it in quotes
      return '\'' + value.replace(/'/g, '"') + '\''
    }
  }
}
