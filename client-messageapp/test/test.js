const assert = require("assert");
const Client = require("../client");
const request = require('supertest');

const { app } = require('../../service/index');

describe("client", () => {
    const hostname = "localhost";
    const port = 9001;
    const client = new Client(hostname, port);

    describe("instace", () => {
        it("should be an object", () => {
            assert.equal(typeof client, "object");
        });
    });
    describe("properties", () => {
        describe("hostname", () => {
            it("should have property hostname equal to fist argument", () => {
                const client = new Client(hostname);
                assert.equal(client.hostname, hostname);
            });
        });
        describe("port", () => {
            it("should have property port equal to second argument", () => {
                const client = new Client("", port);
                assert.equal(client.port, port);
            });
        });
    });
    describe("service", () => {
        describe("type", () => {
            it("should be function", () => {
                assert.equal(typeof client.service, 'function')
            });
        });
        describe("url", () => {
            it("should have as its url based on parameters introduced", () => {
                assert.equal(client.service.defaults.baseURL, `http://${hostname}:${port}`)
            });
        });
        describe("send method", () => {
            describe("type", () => {
                it("should be a function", () => {
                    assert.equal(typeof client.send, "function")
                });
            });
            describe("action", () => {

                it("should return OK when message is sent", function (done) {
                    this.timeout(5000);
                    request(app)
                        .post('/message')
                        .send({ "destination": "test", "body": "test" })
                        .expect(200, done)
                        .expect(response => {
                            assert.equal(response.res.text, 'OK')
                        });
                });

                it("should return error when body is not string", function (done) {
                    this.timeout(5000);
                    request(app)
                        .post('/message')
                        .send({ "destination": "test", "body": 1 })
                        .expect(400, done)
                        .expect(response => assert.equal(response.res.text, 'instance.body is not of a type(s) string. '))
                });

                it("should return error when destination is not string", function (done) {
                    this.timeout(5000);
                    request(app)
                        .post('/message')
                        .send({ "destination": 1, "body": 'test' })
                        .expect(400, done)
                        .expect(response => assert.equal(response.res.text, 'instance.destination is not of a type(s) string. '))
                });

                it("should return error when destination & body are not string", function (done) {
                    this.timeout(5000);
                    request(app)
                        .post('/message')
                        .send({ "destination": 1, "body": 1 })
                        .expect(400, done)
                        .expect(response => assert.equal(response.res.text, 'instance.destination is not of a type(s) string. instance.body is not of a type(s) string. '))
                });

                it("should return error when destination & body are empty strings", function (done) {
                    this.timeout(5000);
                    request(app)
                        .post('/message')
                        .send({ "destination": "", "body": "" })
                        .expect(400, done)
                        .expect(response => assert.equal(response.res.text, 'instance.destination does not meet minimum length of 1. instance.body does not meet minimum length of 1. '))
                });

            });
        });
    });
});
