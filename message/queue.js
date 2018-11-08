const Bull = require('bull');
const uuid = require('uuid');
const saveMessage = require("./clients/saveMessage");

const execute = require('./controllers/sendMessage');

const requestQueue = new Bull('request handling');

const handleRequest = (req, res, next) => {
    const { destination, body } = req.body;
    const messageID = uuid();
    return requestQueue
        .add({ destination, body, messageID, status: "PENDING" })
        .then(() => res.status(200).send(`You can check the message status with this id ${messageID}`))
        .then(() => saveMessage({
            ...req.body,
            status: "PENDING",
            messageID
        }))
}


requestQueue.process(async (job, done) => {
    requestQueue.count()
        .then((count) => console.log(`Currently there ${count > 1 ? 'are' : 'is'} ${count} in queue waiting to be executed`))
        .then(() => execute(job.data))
        .then(() => done())
});

requestQueue.on('completed', function (job, result) {
    console.log(`Job completed with result ${result}`);
});

requestQueue.on('active', function (job, jobPromise) {
    console.log('New worker started a job');
});

requestQueue.on('drained', function () {
    console.log('Job queue is currently empty');
});



module.exports = { handleRequest };