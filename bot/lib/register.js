const fs = require('fs')

module.exports = function (req, res, next) {
  const body = fs.readFileSync('register.html')
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html'
  })
  res.write(body)
  res.end()
  next()
}
