const Message = require("../models/message");
const saveMessageTransaction = require("../transactions/saveMessage");
const { billMessage } = require('../queue');

module.exports = function (messageParams, cb) {
	const MessageModel = Message();
	let message = new MessageModel(messageParams);
	const status = messageParams.status;

	console.log(`Message status: ${message.status}`)
	console.log(`Message params: ${messageParams} %v`, messageParams)

	if (status == "OK") {
		saveMessageTransaction(messageParams, cb)
	} else {
		saveMessageTransaction(messageParams, cb)
	}
};
