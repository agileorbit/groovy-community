# Groovy Community Slack Bot

Originally forked from https://github.com/WeAllJS/wheelie-slack-app.
Handles new account sign ups/invitations/approvals.
Handles administrative commands.

Groovy Community Slack Team ID: T2LNDB8SG

## Installing/Configuring

1. Deploy application (Heroku or EC2). Only requirements is that it needs a public URL that is HTTPS. (Required by Slack).
   1. Also need an available redis install.
1. Set up a new Slack Application.
   1. In the Basic Information section, get the Client ID and Secret.
   1. In the OAuth & Permissions section, enter the redirect URL as `https://<url>/oauth`
   1. In Bot Users, add a new bot user.
   1. In Interactive Messages, set Request URL as `https://<url>/button`
   1. In Slach Commands, add the following:
      1. `/admins` points to `https://<url>/admin`
      1. `/command` points to `https://<url>/command`
   1. Now go back to the Basic Info section and there should be a Verification Token field.
1. Configure environment variables for app:
   1. `SLACK_CLIENT_ID` - from Slack App
   1. `SLACK_CLIENT_SECRET` - from Slack App
   1. `VERIFICATION_TOKEN` - from Slack App
   1. `SLACK_ADMIN_CHANNEL` - channel to send notifications of `/admins` messages to.
   1. `SLACK_SIGNUPS_CHANNEL` - channel to send signup notifications to.
   1. `SLACK_INVITE_TOKEN` - an administrator's Slack API token (apps can't do invites apparently)
   1. `REDISCLOUD_URL` - connection string for redis
1. Install the app into the community by going to `https://<url>/install`
   1. Select the Slack Team

## Configuring a sign up page

The following form template can be used as a sign up page:

```html
<form action="https://{{app_url}}/signup" method="POST">
  <label><span>Name: </span><input name="name" required="" type="text" class="input-field"></label>
  <label><span>Email: </span><input name="email" required="" type="email" class="input-field"></label>
  <label><span>Twitter (optional): </span><input name="twitter" type="text" class="input-field"></label>
  <label><span>GitHub (optional): </span><input name="github" type="text" class="input-field"></label>
  <label><span>About You</span></label>
  <textarea name="about" placeholder="Tell us a bit about yourself! Anything or nothing is fine!" class="textarea-field"></textarea>
  <label><span>&nbsp;</span><input type="checkbox" name="coc" required="" class="input-field"> I agree to the <a href="{{coc_url}}">Code of Conduct</a> and <a href="{{enforcement_url}}">Enforcement Policy</a>
  </label>
  <input type="hidden" name="redirect_uri" value="{{postsignup_url}}}}">
  <input type="hidden" name="team_id" value="{{slack_team_id}}">
  <label><span>&nbsp;</span><button type="submit">Sign Up</button></label>
</form>
```

## Administrating the community

### Notifying admins

Any user can send a private message to the administrations by use the `/admins` command.
The message will be sent to the admins private channel along wit the user name and the channel it came from.

### Administrative commands

The app also exposes the `/command` function to administrate the community.
These commands are only available to admins.
Other users will be shown an access denied message if they attempt to us it.

List available commands:
`/command list`

Get command help:
`/command help list`
