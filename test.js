const test = require('brittle')
const { FormData, File } = require('.')

test('basic', (t) => {
  const form = new FormData()

  form.append('title', 'Hello form')
  form.append(
    'attachment',
    new File(['My attachment'], 'attachment.txt', { type: 'text/plain' })
  )

  t.ok(form)
})
