module.exports = function(conditions = {}) {
  return require("../models/message")().find(conditions);
};
