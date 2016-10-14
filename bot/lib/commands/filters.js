const storage = require('../util/storage')

module.exports.help = function() {
  return "filters - commands for managing signup filters\n" +
    "Subcommands:\n" +
    "  filters list - list configured filters\n" +
    "  filters add <regex> - add regex to compare emails against, rejecting those that match\n" +
    "  filters remove <index> - remove the filter at the specified index (printed from 'filters list')"
}

module.exports = function (data, cb) {
  var subcommand = data.text.split(" ")[1]
  console.log(data)
  switch(subcommand) {
    case "list":
      list(data, cb)
      break;
    case "add":
      add(data, cb)
      break;
    case "remove":
      remove(data, cb)
      break;
    default:
      cb(new Error(`unknown subcommand ${subcommand}`))
  }
}

function list(data, cb) {
  var client = storage()
  client.smembersAsync(`signup-filters-${data.team_id}`).then(function(filters) {
    var filterText = filters.map(function(filter, idx) {
      return `${idx}: ${filter}`
    }).join('\n')
    cb(null, {
      text: `Configured filters:\n+${filterText}`
    })
  }).catch(function(err) {
    cb(err)
  })
}

function add(data, cb) {
  var client = storage()
  var pattern = data.text.split(" ")[2]
  client.saddAsync(`signup-filters-${data.team_id}`, pattern).then(function() {
    cb(null, {
      text: `Added filter: ${pattern}`
    })
  }).catch(function(err) {
    cb(err)
  })
}

function remove(data, cb) {
  var client = storage()
  var idx = data.text.split(" ")[2]
  client.smembersAsync(`signup-filters-${data.team_id}`).then(function(filters) {
    var filter = filters[idx]
    client.sremAsync(`signup-filters-${data.team_id}`, filter).then(function() {
      cb(null, {
        text: `Removed filter: ${filter}`
      })
    }).catch(function(err) {
      cb(err)
    })
  }).catch(function(err) {
    cb(err)
  })
}
