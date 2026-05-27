const http = require('http')
const { URL, URLSearchParams } = require('url')

const hostname = '127.0.0.1'
const port = 3000

const CLIENT_ID = '2b90be46-3fdb-45f1-98bd-081b70cc3d9f'
const CLIENT_SECRET = 'f9d85f7a-052d-4898-9fd2-faf7f9f36698'

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/croissant-oauth')) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    const url = new URL(req.url, `http://${req.headers.host}`)
    const code = url.searchParams.get('code')

    const params = new URLSearchParams({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })

    fetch(`https://croissant-api.eminium.ovh/api/oauth2/user?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        res.end(`User Info: ${JSON.stringify(data)}\n`)
      })
      .catch((error) => {
        console.error('Error:', error)
        res.statusCode = 500
        res.end('Internal Server Error\n')
      })
  } else {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end('Not found')
  }
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
