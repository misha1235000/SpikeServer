import { Request, Response, NextFunction } from 'express';
import { BaseError } from './error';

export function errorHandler(error: BaseError, req: Request, res: Response, next: NextFunction) {
    return res.status(error.status).send({
        message: error.message,
    });
}
