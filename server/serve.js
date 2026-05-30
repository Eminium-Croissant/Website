const http = require('http')
const next = require('next')

const port = Number(process.env.PORT || 8580)
const hostname = process.env.HOSTNAME || '0.0.0.0'
const dev = process.env.NEXT_DEV === 'true' || process.env.NODE_ENV === 'development'

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        handle(req, res)
      })
      .listen(port, hostname, () => {
        console.log(`Server ready on http://${hostname}:${port}`)
      })
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })
