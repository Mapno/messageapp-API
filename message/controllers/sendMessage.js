const http = require("http");
const saveMessage = require("../clients/saveMessage");
const getCredit = require("../clients/getCredit");

const random = n => Math.floor(Math.random() * Math.floor(n));

module.exports = function(messageBody) {
  const body = JSON.stringify(messageBody);

  var query = getCredit();

  saveMessage({
    ...messageBody,
    status: "OK"
  });

  query.exec(function(err, credit) {
    if (err) return console.log(err);

    current_credit = credit[0].amount;

    if (current_credit > 0) {
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

      let postReq = http.request(postOptions);

      postReq.on("response", postRes => {
        if (postRes.statusCode === 200) {
          saveMessage(
            {
              ...messageBody,
              status: "OK"
            },
            function(_result, error) {
              if (error) {
                console.log('Error 500.', error);
              } else {
                console.log('Successfully saved');
              }
            }
          );
        } else {
          console.error("Error while sending message");

          saveMessage(
            {
              ...messageBodys,
              status: "ERROR"
            },
            () => {
              console.log('Error 500: Internal server error: SERVICE ERROR');
            }
          );
        }
      });

      postReq.setTimeout(random(6000));

      postReq.on("timeout", () => {
        console.error("Timeout Exceeded!");
        postReq.abort();

        saveMessage(
          {
            ...messageBody,
            status: "TIMEOUT"
          },
          () => {
            console.log('Error 500: Internal server error: TIMEOUT');
          }
        );
      });

      postReq.on("error", () => {});

      postReq.write(body);
      postReq.end();
    } else {
      console.log('Error 500: No credit error');
    }
  });
};
