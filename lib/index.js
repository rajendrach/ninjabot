
'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var NinjaBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'torchlight';
    this.dbPath = path.resolve(process.cwd(), 'data', 'ninjabot.db');

    this.user = null;
    this.db = null;
};

NinjaBot.prototype.run = function () {
    NinjaBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

NinjaBot.prototype._onStart = function () {
    this._loadBotUser();
    this._connectDb();
    this._firstRunCheck();
};

NinjaBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
    	    console.log('this is the super user is -------->'+user.name);
    	        	    console.log('this is the super user is -------->'+self.name);
        return user.name === self.name;
    })[0];

    console.log('the user is useless-------->'+this.user);
};

NinjaBot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
        process.exit(1);
    }

    this.db = new SQLite.Database(this.dbPath);
};

NinjaBot.prototype._firstRunCheck = function () {
				console.log('Hello You Are here Get going ninja in ---->running the check');

    var self = this;
    self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        // this is a first run
        if (!record) {
        					console.log('IN Welcome message ---->running the check');
            self._welcomeMessage();
            return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
        }

        // updates with new last running time
        self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
    });
};

NinjaBot.prototype._welcomeMessage = function () {
    this.postMessageToChannel(this.channels[0].name, 'Hi guys, roundhouse-kick anyone?' +
        '\n I can give API status, but very honest ones. Just say `torchlight` or `' + this.name + '` to invoke me!',
        {as_user: true});
};

NinjaBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromNinjaBot(message) &&
        this._isMentioningNinja(message)
    ) {

        this._replyWithStatus(message);
    }
};
	
NinjaBot.prototype._isChatMessage = function (message) {
		console.log('Hello You Are here Get going ninja in ---->1'+message.text);
    return message.type === 'message' && Boolean(message.text);
};

NinjaBot.prototype._isChannelConversation = function (message) {
			console.log('Hello You Are here Get going ninja in ---->2');
				console.log('Hello this is the channel'+message.channel[0]);
    return typeof message.channel === 'string' &&
        (message.channel[0] === 'C'||message.channel[0] === 'D');
};

NinjaBot.prototype._isFromNinjaBot = function (message) {
			console.log('Hello You Are here Get going ninja in ---->3'+message.user+'---'+this.user.id);

    return message.user === this.user.id;
};

NinjaBot.prototype._isMentioningNinja = function (message) {
	console.log('Hello You Are here Get going ninja in mentioning ninja---------->'+message);
    return message.text.toLowerCase().indexOf('torchlight') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1 || message.text.indexOf('U5X1B5DGU')>-1;
};

NinjaBot.prototype._replyWithStatus = function (originalMessage) {

    var self = this;
    self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, record.joke, {as_user: true});
        self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
    });
};

NinjaBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};
// inherits methods and properties from the Bot constructor
util.inherits(NinjaBot, Bot);

module.exports = NinjaBot;