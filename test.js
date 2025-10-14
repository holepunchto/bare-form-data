const test = require('brittle')
const { FormData, Blob, File } = require('.')

test('basic', (t) => {
  const form = new FormData()

  form.append('title', 'Hello form')
  form.append('attachment', new File(['My attachment'], 'attachment.txt', { type: 'text/plain' }))

  t.ok(form)

  t.comment(FormData.toBlob(form))
})

test('forward blob type', (t) => {
  const form = new FormData()

  const blob = new Blob(['Hello blob'], { type: 'text/plain' })

  form.append('blob', blob)

  t.is(form.get('blob').type, 'text/plain')
})
