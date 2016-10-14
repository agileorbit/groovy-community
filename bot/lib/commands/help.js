"use strict"

module.exports = function (data, cb) {
  var helpcommand = data.text.split(" ")[1]
  let handler
  try {
    handler = require('./' + helpcommand)
  } catch (e) {
    console.log("error finding help for command", helpcommand)
    console.log(e)
    cb(e)
  }
  let msg
  try {
    msg = handler.help()
  } catch (e) {
    console.error(helpcommand, "does not specify help()")
    console.error(e)
    cb(new Error(`no help available for ${helpcommand}`))
  }
  cb(null, {
    text: handler.help()
  })
}

module.exports.help = function() {
  return "help <command> - prints usage for command"
}
