const Bull = require('bull');
const creditQueue = new Bull('credit-queue');
const messageQueue = new Bull('message-queue');
const updateCredit = require('./clients/updateCredit');

const getCredit = require('./clients/getCredit');

const messagePrice = 1;

creditQueue.process((job, done) => {
    getCredit()
        .then(credit => {
            console.log(credit)
            let { amount } = credit[0];
            if (amount > 0) {
                amount -= messagePrice;
                return updateCredit({
                    amount,
                    status: "ok"
                }, function (_result, error) {
                    if (error) {
                        console.log('Error 500', error);
                    }
                    console.log(`Message charged. Credit left: ${amount}`);
                })
            } else {
                return 'Not enough credit';
            };
        })
        .then(credit => messageQueue.add({ message: job.data, credit }))
        .then(() => done())
        .catch(error => console.log('Error: ', error))
});