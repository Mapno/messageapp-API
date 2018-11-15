const http = require("http");
const saveMessage = require("../clients/saveMessage");
const braker = require('../braker');
const util = require("util");
const logger = require('../logger');
const numOfErrors = require('../prometheus').numOfErrors;

// braker.on("snapshot", snapshot => {
// 	logger.debug({
// 		message: `Circuit open -> ${util.inspect(snapshot.open)}`,
// 		label: 'Message service'
// 	});
// });

module.exports = function (messageBody) {
	const message = messageBody.message;
	delete message["status"];
	const body = JSON.stringify(message);

	const postOptions = {
		host: "messageapp",
		port: 3000,
		path: "/message",
		method: "post",
		json: true,
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(body)
		}
	};

	function asyncFunction(postOptions) {
		return new Promise(function (resolve, reject) {
			let postReq = http.request(postOptions, function (response) {
				if (response.statusCode === 200) {
					console.log({ ...message }),
						saveMessage(
							{
								...message,
								status: "OK"
							},
							function (_result, error) {
								if (error) {
									logger.error({
										message: `Error 500: error`,
										label: 'Message service'
									});
								} else {
									logger.info({
										message: "Successfully saved with status OK",
										label: 'Message service'
									});
								}
							}
						);
					return resolve(message);
				} else if (response.statusCode >= 500) {
					numOfErrors.inc();
					logger.error({
						message: "Error while sending message",
						label: 'Database'
					}),
						saveMessage(
							{
								...message,
								status: "ERROR"
							},
							() => {
								logger.error({
									message: "Error 500: Internal server error: SERVICE ERROR",
									label: 'Message app'
								});
							}
						);
					return reject(new Error("Error while sending message"));
				}
			});

			postReq.setTimeout(1000)
			postReq.on('timeout', () => {
				numOfErrors.inc()
				saveMessage(
					{
						...message,
						status: "TIMEOUT"
					},
					() => {
						logger.error({
							message: 'Error 500: Internal server error: TIMEOUT',
							label: 'Message app'
						});
					}
				);
				return reject(new Error('Timeout error'))
			});


			postReq.write(body);
			postReq.end();
		});
	}

	const circuit = braker.slaveCircuit(asyncFunction)
	circuit
		.exec(postOptions)
		.then(result => {
			logger.info({
				message: `result: ${result}`,
				label: 'Message service'
			});
		})
		.catch(err => {
			logger.error({
				message: `${err}`,
				label: 'Message service'
			});
		});
};
