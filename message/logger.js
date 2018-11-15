const winston = require('winston');
const { format } = winston;

const logger = winston.createLogger({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(
            info => `${info.timestamp} ${info.label} - ${info.level}: ${info.message}`
        )
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;