const Bull = require('bull');
const creditQueue = new Bull('credit-queue', 'redis://redis:6379');
const messageQueue = new Bull('message-queue', 'redis://redis:6379');
const rollbackQueue = new Bull('rollback-queue', 'redis://redis:6379');
const braker = require('./braker');
const logger = require('./logger');
const numOfErrors = require('./prometheus').numOfErrors;

let messageQueueSaturated = false;

const uuid = require('uuid');

const sendMessage = require('./controllers/sendMessage');
const saveMessage = require('./transactions/saveMessage');

const messagePrice = 1;

const port = process.env.PORT;

braker.isOpen() ? messageQueue.pause() : messageQueue.resume();

braker.on('circuitOpen', () => messageQueue.pause());
braker.on('circuitOpen', () => logger.info({
    message: 'Circuit opened',
    label: 'Message service'
}));

braker.on('circuitClosed', () => messageQueue.resume());
braker.on('circuitClosed', () => logger.info({
    message: 'Circuit closed',
    label: 'Message service'
}));


const checkCredit = (req, res, next) => {
    const { destination, body } = req.body;
    const messageID = uuid();
    return messageQueue.count()
        .then(jobs => {
            if(jobs >= 10)
                messageQueueSaturated = true;
            if(jobs <= 5)
                messageQueueSaturated = false;
            
            return messageQueueSaturated;
        })
        .then(() => {
            if (!messageQueueSaturated){
                creditQueue.add({ destination, body, messageID, status: "PENDING", location: { cost: messagePrice, name: 'Default' } });
                return false;
            }
            else
                return true;
    })
        .then(saturated => {
            if(saturated)
                res.status(500).send(`App is currently saturated. Try again later.`)
            else
                res.status(200).send(`You can check the message status with this id ${messageID}`)
                numOfErrors.inc()
        })
        .then(() => saveMessage({
            ...req.body,
            status: "PENDING",
            messageID
        },
            function (_result, error) {
                if (error) {
                    logger.error({
                        message: 'Failed saving message',
                        label: 'Message service'
                    });
                } else {
                    logger.info({
                        message: 'Message successfully saved',
                        label: 'Message service'
                    })
                }
            })
        )
}

const rollbackCharge = message => {
    return rollbackQueue
        .add({ message })
        .then(() => logger.error({
            message: 'Message delivery failed. Doing rollback of charge',
            label: 'Message app'
        }))
}

const handleCredit = data => {
    const { credit } = data;
    if (typeof credit == 'number') {
        return sendMessage(data)
    } else {
        return logger.log({
            message: error,
            level: 'error',
            label: 'Credit service'
        });
    }
}

messageQueue.process(async (job, done) => {
    Promise.resolve(handleCredit(job.data))
        .then(() => done())
});

function messageQueueJobCounter(queue) {
    return queue.count()
        .then(jobs => logger.debug({
            message: `There are ${jobs} messages in queue`,
            label: 'Message service'
        }));
}

// setInterval(() => messageQueueJobCounter(messageQueue), 2000)

module.exports = { checkCredit, rollbackCharge, messageQueueJobCounter };