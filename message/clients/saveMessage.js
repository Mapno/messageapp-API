const saveMessageTransaction = require("../transactions/saveMessage");


module.exports = function (messageParams, cb) {
	const { rollbackCharge } = require('../queue');
	const status = messageParams.status;

	if (status == "OK") {
		saveMessageTransaction(messageParams, cb)
	} else {
		Promise.resolve(saveMessageTransaction(messageParams, cb))
			.then(message => rollbackCharge(messageParams))
	}
};
