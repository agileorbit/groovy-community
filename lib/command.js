"use strict"

const storage = require('./util/storage')
const qs = require('querystring')

module.exports = function (req, res, next) {
  console.log("got a command request")
  const params = qs.parse(req.body)
  if (params.token !== process.env.VERIFICATION_TOKEN) {
    console.error('bad token in request')
    res.send(500, {error: 'invalid verification token'})
    return next()
  }
  console.log("procssing admin command for user ", params.user_id.trim())
  isAdmin(params.user_id.trim(), params, req, res, execute, deny, next)
}

function isAdmin(user_id, params, req, res, success, failure, next) {
  const client = storage()
  return client.hgetAsync("admins", user_id).then(function(is_admin) {
    if (is_admin == "true") {
      console.log("accepting command from user ", user_id)
      return success(params, res, next)
    } else {
      console.log("rejecting command from user (is_admin)", user_id, is_admin)
      return failure(params, res, next)
    }
  }).catch(function(err) {
    console.log("rejecting command from user ", user_id)
    console.log(err)
    return failure(params, res, next)
  })
}

function execute(params, res, next) {
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

  return handler(params, function (err, data) {
    if (err) {
      console.error('Unexpected handler error: ', err)
      res.send(500, {error: err.message})
    } else {
      res.send(200, data)
    }
    return next()
  })
}

function deny(params, res, next) {
  console.error('Non-admin user ', params.user_id, ' attempted to command: ', params.text)
  res.send(200, {
    text: 'Sorry, you are not an admin, so, I will not obey your commands. Good day.'
  })
  return next()
}
