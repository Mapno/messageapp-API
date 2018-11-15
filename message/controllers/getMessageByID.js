const getMessage = require('../clients/getMessageByID');
const logger = require('../logger');

module.exports = (req, res, next) => {
    const messageID = req.params.messageID;

    return getMessage(messageID)
        .then(status => res.status(200).send(status))
        .catch(error => logger.error({
            message: `Error retrieving message status ${error}`,
            label: 'Message service'
        }));
};