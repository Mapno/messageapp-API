const getMessages = require("../clients/getMessages");

module.exports = (req, res) => {
  const client = require('prom-client');
  const counter = new client.Counter({
    name: 'metric_name',
    help: 'metric_help'
  });
  counter.inc(); // Inc with 1

  return getMessages()
    .then(messages => {
      res.json(messages);
    });
};
