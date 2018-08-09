import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import * as express from 'express';
import { NextFunction } from '../../node_modules/@types/connect';

function verifyToken(req: any, res: express.Response, next: NextFunction){
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }

  return jwt.verify(token, config.secret, (err: Error, decoded: any) => {
    if (err) {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }

    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    return next();
  });
}

export const VerifyToken = verifyToken;