require('dotenv').config()
const express = require("express");
const app = express();
const logger = require('./logger');

const Prometheus = require('./prometheus');

app.use(Prometheus.requestCounters);  
app.use(Prometheus.responseCounters);
Prometheus.injectMetricsRoute(app);
Prometheus.startCollection();

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

const port = 9007;

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

const version = process.env.SERVICE_NAME;
app.get('/version', (req, res) => {
	httpRequestDurationMicroseconds
		.labels(req.route.path)
		.observe(responseTimeInMs)
	res.status(200).send(version)
});

app.use(function (err, req, res, next) {
	if (err instanceof ValidationError) {
		res.sendStatus(400);
	} else {
		res.sendStatus(500);
	}
});

app.listen(port, function () {
	logger.log({
		message: `App started on PORT ${port}`,
		label: 'Message service',
		level: 'info'
	});
});
