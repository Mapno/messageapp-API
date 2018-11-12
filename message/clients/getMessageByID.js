module.exports = function (messageID) {
    return require('../models/message')().find({ messageID }, { _id: 0, status: 1 });
};