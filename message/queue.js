const Bull = require('bull');
const creditQueue = new Bull('credit-queue');
const messageQueue = new Bull('message-queue');
// const billQueue = new Bull('rollback-queue');

const uuid = require('uuid');

const sendMessage = require('./controllers/sendMessage');
const saveMessage = require('./transactions/saveMessage');

const checkCredit = (req, res, next) => {
    const { destination, body } = req.body;
    const messageID = uuid();
    return creditQueue
        .add({ destination, body, messageID, status: "PENDING" })
        .then(() => countJobs(creditQueue))
        .then(() => res.status(200).send(`You can check the message status with this id ${messageID}`))
        .then(() => saveMessage({
            ...req.body,
            status: "PENDING",
            messageID
        },
            function (_result, error) {
                if (error) {
                    console.log('Error 500.', error);
                } else {
                    console.log('Successfully saved');
                }
            })
        )
}

const countJobs = queue => {
    return queue.count()
        .then(numberOfJobs => console.log(`There are this many jobs in queue: ${numberOfJobs}`))
}

const billMessage = message => {
    console.log('pues hasta aqui llega', message);
    // billQueue.add({ message })
    // .then(() => console.log('llega hasta aqui'))
}

messageQueue.process(async (job, done) => {
    Promise.resolve(sendMessage(job.data))
        .then(() => done())
});

creditQueue.on('drained', function () {
    console.log('Job queue is currently empty');
});

module.exports = { checkCredit, billMessage };