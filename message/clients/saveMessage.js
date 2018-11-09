const Message = require("../models/message");
const saveMessageTransaction = require("../transactions/saveMessage");


module.exports = function (messageParams, cb) {
	const { rollbackCharge } = require('../queue');
	// const MessageModel = Message();
	// let message = new MessageModel(messageParams);
	const status = messageParams.status;

	if (status == "OK") {
		saveMessageTransaction(messageParams, cb)
	} else {
		Promise.resolve(saveMessageTransaction(messageParams, cb))
			.then(message => rollbackCharge(messageParams))
	}
};
