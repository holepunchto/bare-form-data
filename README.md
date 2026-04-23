# bare-form-data

Form data support for Bare, implementing the `FormData`, `Blob`, and `File` APIs per the W3C File API and WHATWG multipart form data specifications.

```
npm i bare-form-data
```

## Usage

```js
const { FormData, Blob, File, toBlob } = require('bare-form-data')

const form = new FormData()

form.append('title', 'Hello form')
form.append('attachment', new File(['My attachment'], 'attachment.txt', { type: 'text/plain' }))

const blob = toBlob(form)
```

To register `FormData`, `Blob`, and `File` as globals:

```js
require('bare-form-data/global')
```

## API

#### `const formData = new FormData()`

Create a new `FormData` instance.

#### `formData.append(name, value[, filename])`

Append a new entry with the given `name` and `value`. If `value` is not a string and not a `File`, it will be wrapped in a `File` with the given `filename` or `'blob'` as the default name.

#### `formData.set(name, value[, filename])`

Set the entry with the given `name` to `value`, replacing any existing entries with the same name.

#### `formData.delete(name)`

Remove all entries with the given `name`.

#### `formData.get(name)`

Return the first value associated with `name`, or `null` if no entry exists.

#### `formData.getAll(name)`

Return an array of all values associated with `name`.

#### `formData.has(name)`

Return `true` if an entry with the given `name` exists.

#### `const blob = new Blob(parts[, options])`

Create a new `Blob` from an array of `parts`, which may be strings, `Blob` instances, buffers, or typed arrays.

Options include:

```js
options = {
  type
}
```

#### `blob.size`

The size of the blob in bytes.

#### `blob.type`

The MIME type of the blob.

#### `blob.stream()`

Return a `ReadableStream` that yields the blob contents.

#### `const buffer = await blob.buffer()`

Return the blob contents as a `Buffer`.

#### `const buffer = await blob.bytes()`

Return the blob contents as a `Buffer`.

#### `const arrayBuffer = await blob.arrayBuffer()`

Return the blob contents as an `ArrayBuffer`.

#### `const string = await blob.text()`

Return the blob contents as a UTF-8 string.

#### `const isBlob = Blob.isBlob(value)`

Test whether `value` is a `Blob` instance.

#### `const file = new File(parts, name[, options])`

Create a new `File` from an array of `parts` with the given `name`. Extends `Blob`.

Options include:

```js
options = {
  type,
  lastModified: Date.now()
}
```

#### `file.name`

The name of the file.

#### `file.lastModified`

The last modified timestamp of the file in milliseconds.

#### `const isFile = File.isFile(value)`

Test whether `value` is a `File` instance.

#### `const isFormData = isFormData(value)`

Test whether `value` is a `FormData` instance.

#### `const blob = toBlob(formData[, mimeType])`

Encode a `FormData` instance as a `Blob`. The `mimeType` defaults to `'multipart/form-data'` and is currently the only supported type.

## License

Apache-2.0
