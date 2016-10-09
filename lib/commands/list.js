const fs = require('fs')

module.exports = function (data, cb) {
  var subcommands = fs.readdirSync('./lib/commands')
  console.log("Subcommands ", subcommands)
  cb(null, response(subcommands))
}

function response(subcommands) {
  return {
    text: "Available commands are: \n" + subcommands.join("\n")
  }
}
