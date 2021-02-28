// person.controller

import { getToken } from '../get-token';
import { Request, Response, NextFunction } from 'express';
import * as axios from 'axios';
import { PersonUtils } from './person.utils';
import { LOG_LEVEL, log, parseLogData } from '../utils/logger';
import { NotFound, InvalidParameter } from '../utils/error';

export class PersonController {

    /**
     * Gets person by id from kartoffel API
     * @param req - Request
     * @param res - Response
     */
    public static async getPersonById(req: Request, res: Response) {
        const person = 
            await axios.default.get(
                `${process.env.KARTOFFEL_URL}/api/persons/${req.params.id}`,
                { headers: { authorization: await getToken() } },
            );

        res.send(person.data);
    }

    /**
     * Gets persons from kartoffel API
     * @param req - Request
     * @param res - Response
     * @param next - Next Function
     */
    public static async getPersonsByName(req: Request, res: Response, next: NextFunction) {
        const persons =
            await axios.default.
                get(`${process.env.KARTOFFEL_URL}/api/persons/search?fullname=${encodeURIComponent(req.query.fullname)}`,
                    { headers: { authorization: await getToken() } });

        res.send(persons.data);
    }

    /**
     * Gets persons from kartoffel by the list given.
     * @param req - Request
     * @param res - Response
     * @param next - Next Function
     */
    public static async getPersonsByList(req: Request, res: Response, next: NextFunction) {
        res.send(await PersonUtils.getPerson(req.body.personIds));
    }
}
