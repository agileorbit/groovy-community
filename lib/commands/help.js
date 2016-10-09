"use strict"

module.exports = function (data, cb) {
  var helpcommand = data.text.split(" ")[1]
  let handler
  try {
    handler = require('./commands/' + helpcommand)
  } catch (e) {
    console.error('No command: ', helpcommand)
    console.error(e)
    res.send(500, {error: 'no such command handler'})
    return next()
  }
  let msg
  try {
    msg = handler.help()
  } catch (e) {
    console.error(helpcommand, "does not specify help()")
    console.error(e)
    res.send(200, {text: "no help available for " + helpcommand})
  }
  cb(null, {
    text: handler.help()
  })
}

modules.exports.help = function() {
  return "help <command> - prints usage for command"
}
