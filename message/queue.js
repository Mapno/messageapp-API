const Bull = require('bull');
const creditQueue = new Bull('credit-queue', 'redis://127.0.0.1:6379');
const messageQueue = new Bull('message-queue', 'redis://127.0.0.1:6379');
const rollbackQueue = new Bull('rollback-queue', 'redis://127.0.0.1:6379');

const uuid = require('uuid');

const sendMessage = require('./controllers/sendMessage');
const saveMessage = require('./transactions/saveMessage');

const messagePrice = 1;

const port = process.env.PORT;

const checkCredit = (req, res, next) => {
    const { destination, body } = req.body;
    const messageID = uuid();
    return creditQueue
        .add({ destination, body, messageID, status: "PENDING", location: { cost: messagePrice, name: 'Default' } })
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

const rollbackCharge = message => {
    return rollbackQueue
        .add({ message })
        .then(() => console.log('Message delivery failed. Doing rollback of charge'))
}

const handleCredit = data => {
    const { credit } = data;
    if(typeof credit == 'number') {
        return sendMessage(data)
    } else {
        return console.log('Error: ', credit);
    }
}

messageQueue.process(async (job, done) => {
    Promise.resolve(handleCredit(job.data))
        .then(() => done())
});

module.exports = { checkCredit, rollbackCharge };