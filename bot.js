if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var os = require('os');
var _ = require('./node_modules/underscore/underscore.js')

var controller = Botkit.slackbot({
    debug: true,
});

var fullTeamList = [];
var fullChannelList = [];
var bot = controller.spawn({
    token: process.env.token
}).startRTM(function (err, bot) {
    if (err) {
        throw new Error(err);
    }

    // @ https://api.slack.com/methods/users.list
    bot.api.users.list({}, function (err, response) {
        if (response.hasOwnProperty('members') && response.ok) {
            var total = response.members.length;
            for (var i = 0; i < total; i++) {
                var member = response.members[i];
                if(member.name.indexOf('bot') === -1 && member.name === 'pierre.baillif') { //Just for test purposes
                  fullTeamList.push({name: member.name, id: member.id});
                }
            }
        }
    });

    // @ https://api.slack.com/methods/channels.list
    bot.api.channels.list({}, function (err, response) {
        if (response.hasOwnProperty('channels') && response.ok) {
            var total = response.channels.length;
            for (var i = 0; i < total; i++) {
                var channel = response.channels[i];
                fullChannelList.push({name: channel.name, id: channel.id});
            }
        }
    });
});

controller.hears(['meeting'],'ambient', function(bot, message) {
    names = []
    _.each(fullTeamList, function(member) {
        names.push('@' + member.name);
        bot.startPrivateConversation({ user: member.id }, function(err, conversation) {
          conversation.say('Hey, are you available for a meeting at ... ?');
        });
    });
    bot.reply(message, 'Wait a little bit, I am asking to ' + names.join(', ') + '...');
});
