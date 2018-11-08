const Message = require('../models/message')();

module.exports = function (messageID) {
    return Message.find({ messageID }, { _id: 0, status: 1 });
};