const http = require("http");
const saveMessage = require("../clients/saveMessage");
const braker = require('../braker');
const util = require("util");

braker.on("snapshot", snapshot => {
	console.log(`Circuit open -> ${util.inspect(snapshot.open)}`);
});

module.exports = function (messageBody) {
	const message = messageBody.message;
	delete message["status"];
	const body = JSON.stringify(message);

	const postOptions = {
		host: "localhost",
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
									console.log("Error 500.", error);
								} else {
									console.log("Successfully saved with status OK");
								}
							}
						);
					return resolve(message);
				} else if (response.statusCode >= 500) {
					console.error("Error while sending message"),
						saveMessage(
							{
								...message,
								status: "ERROR"
							},
							() => {
								console.log("Error 500: Internal server error: SERVICE ERROR");
							}
						);
					return reject(new Error("Error while sending message"));
				}
			});

			postReq.setTimeout(1000)
			postReq.on('timeout', () => {
				saveMessage(
					{
						...message,
						status: "TIMEOUT"
					},
					() => {
						console.log('Error 500: Internal server error: TIMEOUT');
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
			console.log(`result: ${result}`);
		})
		.catch(err => {
			console.error(`${err}`);
		});
};
