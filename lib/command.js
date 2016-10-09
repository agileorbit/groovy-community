"use strict"

const storage = require('./util/storage')
const qs = require('querystring')

module.exports = function (req, res, next) {
  const params = JSON.parse(qs.parse(req.body).payload)
  if (params.token !== process.env.VERIFICATION_TOKEN) {
    console.error('bad token in request')
    res.send(500, {error: 'invalid verification token'})
    return next()
  }
  isAdmin(params.user_id, params, req, res, execute, deny)
}

function isAdmin(user_id, params, req, res, success, failure) {
  const client = storage()
  client.hkeysAsync("admins").then(function(ids) {
    if (ids.contains(user_id)) {
      console.log("processing command for user ", user_id)
      success(params, res)
    } else {
      console.log("rejecting command from user ", user_id)
      failure(params, res)
    }
  })
}

function execute(params, res) {
  console.log("command string ", params.text.trim())
  var subcommand = params.text.split(" ")[0].trim()
  console.log("subcommand ", subcommand)
  let handler
  try {
    handler = require('./commands/' + subcommand)
  } catch (e) {
    console.error('No handler for command: ', subcommand)
    console.error(e)
    res.send(500, {error: 'no such command handler'})
    return next()
  }

  handler(params, function (err, data) {
    if (err) {
      console.error('Unexpected handler error: ', err)
      res.send(500, {error: err.message})
    } else {
      res.send(200, data)
    }
    return next()
  })
}

function deny(params, res) {
  console.error('Non-admin user ', params.user_id, ' attempted to command: ', params.text)
  res.send(200, {
    text: 'Sorry, you are not an admin, so, I will not obey your commands. Good day.'
  })
}
