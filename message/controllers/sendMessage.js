const http = require("http");
const saveMessage = require("../clients/saveMessage");

module.exports = function (messageBody) {

	const promise1 = Promise.resolve(function () {
		const message = messageBody.message;
		delete message['status'];
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
		}

		let postReq = http.request(postOptions);
		return { postReq, message, body };
	}());

	promise1.then(data => {
		const { postReq, message, body } = data
		postReq.on("response", postRes => {
			if (postRes.statusCode === 200) {
				console.log({ ...message })
				saveMessage(
					{
						...message,
						status: "OK"
					},
					function (_result, error) {
						if (error) {
							console.log('Error 500.', error);
						} else {
							console.log('Successfully saved with status OK');
						}
					}
				);
			} else {
				console.error("Error while sending message");

				saveMessage(
					{
						...message,
						status: "ERROR"
					},
					() => {
						console.log('Error 500: Internal server error: SERVICE ERROR');
					}
				);
			}
		});

		postReq.setTimeout(1000);

		postReq.on("timeout", () => {
			console.error("Timeout Exceeded!");
			postReq.abort();

			saveMessage(
				{
					...message,
					status: "TIMEOUT"
				},
				() => {
					console.log('Error 500: Internal server error: TIMEOUT');
				}
			);
		});

		postReq.on("error", () => {
			console.error("Error while sending message");

			saveMessage(
				{
					...message,
					status: "ERROR"
				},
				() => {
					console.log('Error 500: Internal server error: SERVICE ERROR');
				}
			);
		});

		postReq.write(body);
		postReq.end();
	})
		.catch(error => console.log('Error: ', error))
};
