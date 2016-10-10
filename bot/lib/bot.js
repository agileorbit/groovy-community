"use strict"

const storage = require('./util/storage')
const bluebird = require('bluebird')
const slack = require('slack')
const users = bluebird.promisifyAll(slack.users)

module.exports.listen = function () {
  const sub = storage()
  const client = storage()
  sub.on('message', function (channel, team_id) {
    client.hgetAsync('teams', team_id).then(launchBot)
  })
  sub.subscribe('team_auth')
  client.hgetall('teams', function (err, teams) {
    if (err) {
      console.error('uhhh, error getting teams list: ', err)
    }
    if (!teams) {
      console.log('no registered teams')
    } else {
      Object.keys(teams).forEach(function (key) {
        console.log('launching bot for ' + key)
        launchBot(teams[key])
      })
    }
  })
}

function launchBot (team_data) {
  const team = JSON.parse(team_data)
  const bot = slack.rtm.client()
  const token = team.bot.bot_access_token
  users.listAsync({
    token
  }).then(function (body) {
    const client = storage()
    var admins = body.members.filter(function(u) {
      return u.is_admin
    }).map(function(u) {
      return u.id
    }).forEach(function(id) {
      console.log("found admin with id", id)
      client.hsetAsync("admins", id, true).then(function(hash) {})
    })
  })
  bot.message(function (event) {
    let handler
    try {
      handler = require('./events/' + event.type.trim())
    } catch (e) {
      return console.error('No handler for event type: ', event.type)
    }

    handler({ event: event, team_id: team.team_id }, function (err) {
      if (err) {
        console.error('Unexpected handler error: ', err)
      }
    })
  })
  bot.listen({token: token})
}
