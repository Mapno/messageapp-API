const Register = require('prom-client').register;  
const Counter = require('prom-client').Counter;  
const Summary = require('prom-client').Summary;  
const ResponseTime = require('response-time');
const logger = require('./logger');

module.exports.numOfRequests = numOfRequests = new Counter({  
    name: 'numOfRequests',
    help: 'Number of requests made',
    labelNames: ['method']
});

module.exports.pathsTaken = pathsTaken = new Counter({  
    name: 'pathsTaken',
    help: 'Paths taken in the app',
    labelNames: ['path']
});

module.exports.responses = responses = new Summary({  
    name: 'responses',
    help: 'Response time in millis',
    labelNames: ['method', 'path', 'status']
});

module.exports.numOfErrors = numOfErrors = new Counter({
    name: 'numOfErrors',
    help: 'Number of errors in request',
    labelNames: ['method', 'statusCode']
})

module.exports.startCollection = function () {
    logger.info({
        message: `Starting the collection of metrics, the metrics are available on /metrics`,
        label: 'Prometheus'
    })
    require('prom-client').collectDefaultMetrics();
};

module.exports.requestCounters = function (req, res, next) {  
    if (req.path != '/metrics') {
        numOfRequests.inc({ method: req.method });
        pathsTaken.inc({ path: req.path });
    }
    next();
}

module.exports.responseCounters = ResponseTime(function (req, res, time) {  
    if(req.url != '/metrics') {
        responses.labels(req.method, req.url, res.statusCode).observe(time);
        
    }
})

module.exports.injectMetricsRoute = function (App) {  
    App.get('/metrics', (req, res) => {
        res.set('Content-Type', Register.contentType);
        res.end(Register.metrics());
    });
};