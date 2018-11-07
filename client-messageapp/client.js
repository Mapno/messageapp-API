const axios = require("axios");

class Client {
    constructor(hostname, port) {
        this.hostname = hostname;
        this.port = port;
        this.service = axios.create({
            baseURL: `http://${this.hostname}:${this.port}`
        });
    };

    send(destination, message) {
        return this.service
            .post("/message", { destination, body: message })
            .then(response => response.data)
            .catch(error => error.response);
    };

    retrieveMessages() {
        return this.service
            .get("/")
            .then(response => response.data)
            .catch(error => error.response);
    };

    updateCredit(amount) {
        return this.service
            .post('/credit', { amount })
            .then(response => response.data)
            .catch(error => error.response);
    };
};

module.exports = Client;
