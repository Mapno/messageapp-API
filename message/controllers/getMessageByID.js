const getMessage = require('../clients/getMessageByID');

module.exports = (req, res, next) => {
    const messageID = req.params.messageID;

    return getMessage(messageID)
        .then(status => res.status(200).send(status))
        .catch(error => console.log('Error retrieving message status', error));
};