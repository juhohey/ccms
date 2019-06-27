import Snackbar from 'node-snackbar'

export const showSnackError = text => error => {
  Snackbar.show({ text: `:( ${text}: \n\n ${error}`, duration: 0, actionTextColor: '#E91E63' })
}
export const showSnack = text => {
  Snackbar.show({ text, duration: 0, actionTextColor: '#E91E63' })
}
