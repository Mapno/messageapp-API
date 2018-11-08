const database = require("../database/database");
const Message = require("../models/message");
const { cleanClone } = require("../utils/utils");
const _ = require("lodash");

function saveMessageReplica(replica, retries) {
	if (retries > 0) {
		replica.markModified("body");
		return replica
			.save()
			.then(doc => {
				console.log("Message replicated successfully", doc);
				return doc;
			})
			.catch(err => {
				console.log("Error while saving message replica", err);
				console.log("Retrying...");
				return saveMessageReplica(replica, retries - 1);
			});
	}
}

function saveMessageTransaction(newValue) {
	const MessagePrimary = Message();
	const MessageReplica = Message("replica");

	const { messageID, status } = newValue;
	let message = new MessagePrimary(newValue);

	return MessagePrimary.findOneAndUpdate(
		{ messageID },
		{ status },
		{ new: true }
	).then(existingMessage => {
		if (existingMessage != null) {
			MessageReplica.findOneAndUpdate({ messageID }, { status }, { new: true })
				.then(doc => console.log(doc))
		} else {
			message
				.save()
				.then(doc => {
					console.log("Message saved successfully:", doc);
					return cleanClone(doc);
				})
				.then(clone => {
					let replica = new MessageReplica(clone);
					saveMessageReplica(replica, 3);
					return clone;
				})
				.catch(err => {
					console.log("Error while saving message", err);
					throw err;
				});
		}
	});
}

module.exports = function (messageParams, cb) {
	saveMessageTransaction(messageParams)
		.then(() => cb())
		.catch(err => {
			cb(undefined, err);
		});
};
