const storage = require('./util/storage')
const slack = require('slack')
const bluebird = require('bluebird')
const qs = require('querystring')
const chat = bluebird.promisifyAll(slack.chat)

const required_fields = ['name', 'email', 'about', 'coc', 'question'];
const re_rfc5322 = /([A-Z0-9a-z._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,6})/;
const signup_channel = process.env.SLACK_SIGNUPS_CHANNEL || 'admin-signups'

module.exports = function (req, res, next) {
  console.log('got an signup request!', req.body)
  const params = qs.parse(req.body)

  const errors = validateFields(params);
  if (errors.length > 0) {
    res.send(400, errors);
    return;
  }

  params.email = cleanseEmail(params);

  const client = storage()
  return client.hgetAsync('teams', params.team_id).then(function (json) {
    if (!json) {
      res.send(400, {error: 'team_not_found'})
      return next()
    }
    const team = JSON.parse(json)
    const token = team.bot.bot_access_token
    if (!token) throw new Error('no token for that team')
    return client.hsetAsync(
      `signups-${params.team_id}`,
      params.email,
      JSON.stringify({
        email: params.email,
        name: params.name,
        twitter: params.twitter,
        github: params.github,
        linkedin: params.linkedin,
        website: params.website,
        about: params.about
      })
    ).then(function () {
      client.quit()
      const msg = composeMessage(token, params)
      return chat.postMessageAsync(msg)
    }).then(function () {
      if (!params.redirect_uri) {
        res.send(200, 'signup request sent')
        next()
      } else {
        res.redirect(params.redirect_uri, next)
      }
    }).catch(function (err) {
      res.send(500, {
        msg: err.message
      })
      next()
    })
  })
}

function validateFields (params) {
  var errors = [];
  for (idx in required_fields) {
    var field = required_fields[idx];
    if (!Object.prototype.hasOwnProperty.call(params, field) || !params[field] || !params[field].trim().length > 0) {
      errors.push({ field: field, required: true, error: "Field is empty" });
    } else if (field === 'email' && !re_rfc5322.test(params[field])) {
      errors.push({ field: field, required: true, error: "Email failed RFC5322 validation" });
    } else  if (field === 'question' && params[field].trim() !== '42') {
      errors.push({ field: field, required: true, error: "Check your arithmetic" });
    }
  }
  return errors;
}

function cleanseEmail (params) {
  return params.email.match(re_rfc5322)[0];
}

function composeMessage (token, params) {
  if (!params.twitter.includes('twitter.com')) {
    params.twitter = '<https://twitter.com/' + params.twitter + '|' + params.twitter + '>'
  }

  if (!params.github.includes('github.com')) {
    params.github = '<https://github.com/' + params.github + '|' + params.github + '>'
  }
  return {
    token,
    channel: signup_channel,
    text: 'New Signup!',
    attachments: [{
      title: params.email,
      fields: [{
        title: 'Twitter',
        value: params.twitter,
        short: true
      }, {
        title: 'GitHub',
        value: params.github,
        short: true
      }, {
        title: 'LinkedIn',
        value: params.linkedin,
        short:true
      },{
        title: 'Website',
        value: params.website,
        short: true
      }],
      author_name: params.name,
      author_icon: 'https://api.slack.com/img/api/homepage_custom_integrations-2x.png'
    }, {
      title: 'About Me',
      text: params.about
    }, {
      title: 'Would you like to invite this person?',
      callback_id: 'invite',
      color: '#3AA3E3',
      attachment_type: 'default',
      actions: [{
        name: 'invite',
        text: 'Invite',
        type: 'button',
        value: params.email
      }, {
        name: 'no',
        text: 'No',
        type: 'button',
        value: ''
      }]
    }]
  }
}
