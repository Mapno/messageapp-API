const winston = require('winston');
const { format } = winston;

const capitalize = word => {
    return word.charAt(0).toUpperCase() + word.slice(1)
} 

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
}

const logger = winston.createLogger({
    levels,
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(
            info => `${info.timestamp} [${capitalize(info.label)}] ${info.level}: ${info.message}`
        )
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;