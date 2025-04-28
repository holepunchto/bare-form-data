module.exports = exports = class FormData {
  constructor() {
    this._entries = []
  }

  append(name, value, filename) {
    if (typeof value !== 'string') {
      if (!isFile(value) || filename) {
        value = new File([value], filename || 'blob')
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

exports.FormData = exports

class Blob {
  // https://w3c.github.io/FileAPI/#dom-blob-blob
  constructor(parts, options) {
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
}

exports.Blob = Blob

function isBlob(value) {
  return value instanceof Blob
}

exports.isBlob = isBlob

class File extends Blob {
  // https://w3c.github.io/FileAPI/#dom-file-file
  constructor(parts, name, options) {
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
}

exports.File = File

function isFile(value) {
  return value instanceof File
}

exports.isFile = isFile

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
    } else {
      chunks.push(part)
    }
  }

  return Buffer.concat(chunks)
}
