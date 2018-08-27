// error.handler

import { Request, Response, NextFunction } from 'express';
import { BaseError } from './error';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof BaseError) {
        return res.status(error.status).send({ message: error.message });
    }

    return res.status(500).send({ message: error.message });
}
