const fs = require('fs')

module.exports = function (data, cb) {
  var subcommands = fs.readdirSync('./lib/commands')
  console.log("Subcommands ", subcommands)
  cb(null, response(subcommands))
}

module.exports.help = function() {
  return "list - prints available commands"
}

function response(subcommands) {
  return {
    text: "Available commands are: \n" + subcommands.map(function(name) {
      return name.split(".")[0]
    }).join("\n")
  }
}
