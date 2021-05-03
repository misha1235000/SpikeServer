import * as winston from 'winston';
import * as winstonRotateFile from 'winston-daily-rotate-file';
const LogstashTransport = require('winston-logstash-transport').LogstashTransport;
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

// log levels
export enum LOG_LEVEL {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    VERBOSE = 'verbose',
    DEBUG = 'debug',
    SILLY = 'silly',
}

const esTransportOpts = {
    level: 'info',
    index: 'spike-server',
    client: client
};

const logstashActive = process.env.LOGSTASH_ACTIVE || false;

const logstashTransport = new LogstashTransport({
  host: process.env.LOGSTASH_HOST || 'http://localhost',
  port: parseInt(process.env.LOGSTASH_PORT || '12345')
});

const esTransport = new ElasticsearchTransport(esTransportOpts);

const transports = [esTransport];

logstashActive === 'true' ? transports.push(logstashTransport) : null;

const logger = winston.createLogger({
    defaultMeta: { service: 'SpikeServer' },
    transports,
    exitOnError: false,
});

const format = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json());
logger.add(new winstonRotateFile({
    format,
    level: LOG_LEVEL.INFO,
    datePattern: 'YYYY-MM-DD',
    maxSize: '3g',
    maxFiles: 3,
    filename: process.env.LOG_FILE_NAME,
    dirname: process.env.LOG_FILE_DIR || '.',
}));

export const log = (severity: string, meta: any) => {
    const { message, ...other } = meta;
    logger.log(severity, message, other);
};

export const parseLogData = (message: string,
                             name:    string,
                             code:    string,
                             stack:   string) => {
    return { message, name, code, stack, service: 'SpikeServer' };
};
