'use strict';

var NinjaBot = require('../lib/index');

var token = 'xoxb-201045183572-sxfPuRxC7ojSUv7ZGc6Nk0wc';
var dbPath = 'localhost://apiData';
var name = 'torchlight';

var ninjabot = new NinjaBot({
    token: token,
    dbPath: dbPath,
    name: name
});

ninjabot.run();