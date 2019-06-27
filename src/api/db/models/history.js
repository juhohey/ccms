const history = {
  by: String, // user.id
  action: String, // PAGE_PUBLISH | PAGE_UNPUBLISH | PAGE_EDIT | PAGE_DELETE | PAGE_CREATE | USER_CREATE | USER_EDIT | USER_DELETE | USER_LOCKOUT
  targetId: String,
  content: String,
  when: Number
}
module.exports = {
  history
}
