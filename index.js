const { ReadableStream } = require('bare-stream/web')
const errors = require('./lib/errors')

class FormData {
  constructor() {
    this._entries = []
  }

  append(name, value, filename) {
    if (typeof value !== 'string') {
      if (!isFile(value) || filename) {
        value = new File([value], filename || 'blob', { type: value.type })
      }
    }

    this._entries.push([name, value])
  }

  delete(name) {
    this._entries = this._entries.filter((entry) => entry[0] !== name)
  }

  get(name) {
    const entry = this._entries.find((entry) => entry[0] === name)

    return entry ? entry[1] : null
  }

  getAll(name) {
    const entries = []

    for (const entry of this._entries) {
      if (entry[0] === name) entries.push(entry[1])
    }

    return entries
  }

  has(name) {
    return this._entries.findIndex((entry) => entry[0] === name) !== -1
  }

  set(name, value, filename) {
    this.delete(name)
    this.append(name, value, filename)
  }

  [Symbol.iterator]() {
    return this._entries[Symbol.iterator]()
  }

  [Symbol.for('bare.inspect')]() {
    return {
      __proto__: { constructor: FormData },

      entries: this._entries
    }
  }
}

module.exports = exports = FormData

exports.FormData = FormData

function isFormData(value) {
  return value instanceof FormData
}

exports.isFormData = isFormData

class Blob {
  // https://w3c.github.io/FileAPI/#dom-blob-blob
  constructor(parts, options = {}) {
    const { type = '' } = options

    this._bytes = processBlobParts(parts)
    this._type = type
  }

  // https://w3c.github.io/FileAPI/#dfn-size
  get size() {
    return this._bytes.byteLength
  }

  // https://w3c.github.io/FileAPI/#dfn-type
  get type() {
    return this._type
  }

  // https://w3c.github.io/FileAPI/#stream-method-algo
  stream() {
    const bytes = this._bytes

    return new ReadableStream({
      start(controller) {
        controller.enqueue(bytes)
        controller.close()
      }
    })
  }

  async buffer() {
    return Buffer.from(this._bytes)
  }

  // https://w3c.github.io/FileAPI/#bytes-method-algo
  async bytes() {
    return this.buffer()
  }

  // https://w3c.github.io/FileAPI/#arraybuffer-method-algo
  async arrayBuffer() {
    const buffer = new ArrayBuffer(this._bytes.byteLength)
    buffer.set(this._bytes)
    return buffer
  }

  // https://w3c.github.io/FileAPI/#text-method-algo
  async text() {
    return this._bytes.toString()
  }

  [Symbol.for('bare.inspect')]() {
    return {
      __proto__: { constructor: Blob },

      size: this.size,
      type: this.type
    }
  }
}

exports.Blob = Blob

function isBlob(value) {
  return value instanceof Blob
}

Blob.isBlob = isBlob

class File extends Blob {
  // https://w3c.github.io/FileAPI/#dom-file-file
  constructor(parts, name, options = {}) {
    const { lastModified = Date.now() } = options

    super(parts, options)

    this._name = name
    this._lastModified = lastModified
  }

  // https://w3c.github.io/FileAPI/#dfn-name
  get name() {
    return this._name
  }

  // https://w3c.github.io/FileAPI/#dfn-lastModified
  get lastModified() {
    return this._lastModified
  }

  [Symbol.for('bare.inspect')]() {
    return {
      __proto__: { constructor: File },

      size: this.size,
      type: this.type,
      name: this.name,
      lastModified: this.lastModified
    }
  }
}

exports.File = File

function isFile(value) {
  return value instanceof File
}

File.isFile = isFile

// https://w3c.github.io/FileAPI/#process-blob-parts
function processBlobParts(parts) {
  const chunks = []

  for (const part of parts) {
    if (typeof part === 'string') {
      const buffer = Buffer.from(part)
      if (parts.length === 1) return buffer
      chunks.push(buffer)
    } else if (isBlob(part)) {
      chunks.push(part._bytes)
    } else if (Buffer.isBuffer(part)) {
      chunks.push(part)
    } else if (ArrayBuffer.isView(part)) {
      chunks.push(Buffer.from(part.buffer, part.byteOffset, part.byteLength))
    } else {
      chunks.push(Buffer.from(part))
    }
  }

  return Buffer.concat(chunks)
}

function toBlob(formData, mimeType = 'multipart/form-data') {
  switch (mimeType) {
    case 'multipart/form-data':
      return toMultipartBlob(formData)
    default:
      throw errors.INVALID_MIME_TYPE(`Invalid MIME type '${mimeType}'`)
  }
}

exports.toBlob = toBlob

function escape(value) {
  return value.replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22')
}

function normalizeLinefeeds(value) {
  return value.replace(/\r?\n|\r/g, '\r\n')
}

const linefeed = Buffer.from('\r\n')

// https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#multipart/form-data-encoding-algorithm
function toMultipartBlob(formData) {
  const boundary = Math.random().toString(16).slice(2, 18).padStart(16, '0')

  const prefix = `--${boundary}\r\nContent-Disposition: form-data`

  const parts = []

  for (const [name, value] of formData) {
    if (typeof value === 'string') {
      const chunk = Buffer.from(
        prefix +
          `; name="${escape(normalizeLinefeeds(name))}"` +
          `\r\n\r\n${normalizeLinefeeds(value)}\r\n`
      )

      parts.push(chunk)
    } else {
      const chunk = Buffer.from(
        prefix +
          `; name="${escape(normalizeLinefeeds(name))}"` +
          `; filename="${escape(value.name)}"` +
          `\r\nContent-Type: ${value.type || 'application/octet-stream'}\r\n\r\n`
      )

      parts.push(chunk, value, linefeed)
    }
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`))

  return new Blob(parts, {
    type: 'multipart/form-data; boundary=' + boundary
  })
}
