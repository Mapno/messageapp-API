const getMessages = require("../clients/getMessages");

module.exports = (req, res) => {
  return getMessages()
    .then(messages => {
      res.json(messages);
    });
};
