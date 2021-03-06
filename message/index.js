const express = require("express");

const bodyParser = require("body-parser");
const {
  Validator,
  ValidationError
} = require("express-json-validator-middleware");

require('./queue');

const getMessages = require("./controllers/getMessages");
const getMessageByID = require("./controllers/getMessageByID");
const checkHealth = require('./controllers/checkHealth');
const { checkCredit } = require("./queue");

const app = express();
const port = process.env.PORT;

const validator = new Validator({ allErrors: true });
const { validate } = validator;

const messageSchema = {
  type: "object",
  required: ["destination", "body"],
  properties: {
    destination: {
      type: "string"
    },
    body: {
      type: "string"
    },
    location: {
      name: {
        type: "string"
      },
      cost: {
        type: "number"
      }
    }
  }
};

app.post(
  "/messages",
  bodyParser.json(),
  validate({ body: messageSchema }),
  checkCredit
);

app.get("/messages", getMessages);

app.get("/messages/:messageID/status", getMessageByID);

app.get('/health', checkHealth);

app.use(function(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.sendStatus(400);
  } else {
    res.sendStatus(500);
  }
});

app.listen(port, function() {
  console.log(`App started on PORT ${port}`);
});
