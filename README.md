# bare-form-data

Form data support for Bare.

```
npm i bare-form-data
```

## Usage

```js
const { FormData, File } = require('bare-form-data')

const form = new FormData()

form.append('title', 'Hello form')
form.append(
  'attachment',
  new File(['My attachment'], 'attachment.txt', { type: 'text/plain' })
)
```

## License

Apache-2.0
