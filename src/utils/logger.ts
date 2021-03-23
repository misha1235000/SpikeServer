import * as winston from 'winston';
import * as winstonRotateFile from 'winston-daily-rotate-file';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost' });

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

const esTransport = new ElasticsearchTransport(esTransportOpts);

const logger = winston.createLogger({
    defaultMeta: { service: 'SpikeServer', hostname: 'HOSTNAME' },
    transports: [
        esTransport
    ]
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
    return { message, name, code, stack, service: 'SpikeServer', hostname: 'HOSTNAME' };
};
