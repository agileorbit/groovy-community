const fs = require('fs')

module.exports = function (data, cb) {
  var subcommands = fs.readdirSync('.')
  console.log("Subcommands ", subcommands)
  cb(null, subcommands)
}
