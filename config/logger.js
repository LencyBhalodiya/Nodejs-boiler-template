import { createLogger, format, transports } from 'winston';
const { combine, timestamp, json, colorize } = format;
import morgan from 'morgan';

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
        return `${level}: ${message}`;
    })
);

const date = new Date();//get filename acc to date
const fileName = `server-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`

// Create a Winston logger
export const logger = createLogger({
    level: "info",
    format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }), json()),
    transports: [
        new transports.Console({
            format: consoleLogFormat,
        }),
        new transports.File({ filename: `logs/${fileName}.log` }),
    ],
});

const morganFormat = ":method :url :status :response-time ms";

export const morganLogger = morgan(morganFormat, {
    stream: {
        write: (message) => {
            const log = {
                method: message.split(" ")[0],
                url: message.split(" ")[1],
                status: message.split(" ")[2],
                responseTime: message.split(" ")[3],
            };
            logger.info(JSON.stringify(log));
        },
    },
})

