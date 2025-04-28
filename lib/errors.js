module.exports = class FormDataError extends Error {
  constructor(msg, code, fn = FormDataError) {
    super(`${code}: ${msg}`)
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, fn)
    }
  }

  get name() {
    return 'FormDataError'
  }

  static INVALID_MIME_TYPE(msg) {
    return new FormDataError(
      msg,
      'INVALID_MIME_TYPE',
      FormDataError.INVALID_MIME_TYPE
    )
  }
}
