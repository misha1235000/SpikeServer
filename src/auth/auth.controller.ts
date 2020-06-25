// auth.controller

import { Request, Response, NextFunction } from 'express';
import { TeamValidator } from '../team/team.validator';
import { TeamRepository } from '../team/team.repository';
import { LOG_LEVEL, log, parseLogData } from '../utils/logger';
import { ITeam } from '../team/team.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from '../config';
import { Unauthorized } from './auth.error';
import { InvalidParameter } from '../utils/error';

export class AuthController {
    static readonly AUTH_MESSAGES = {
        INVALID_CREDENTIALS: 'Incorrect teamname or password given.',
        INVALID_PARAMETER: 'Team parameter is missing.',
        UNAUTHORIZED_NO_TOKEN: 'Unauthorized, No token provided.',
        UNAUTHORIZED_BAD_TOKEN: 'Invalid token provided.',
        UNAUTHORIZED_UNEXSISTING_TEAM: 'Token signed with unexisting team.',
        NO_STACK: 'No stack was found.',
        SUCCESSFULLY_TEAM_CREATE: 'Successfully Created a team.',
        SUCCESSFULLY_REGISTER: 'Successfully registered.',
    };

    static readonly publicKeyOfClient = readFileSync(`${join(__dirname, '../certs/files/publickeyofclient.pem')}`);

    /**
     * Register a new team to the mongo, and generates a JWT
     * for the session of the current team. (As a login)
     * @param req - Request
     * @param res - Response
     */
    public static async register(req: Request, res: Response) {
        const team = req.body.team as ITeam;

        // If team parameter provided
        if (team) {
            team.teamname = team.teamname.toLowerCase();

            team.userIds = [];
            team.adminIds = [];
            team.adminIds.push(team.ownerId);

            // Calls the function that creates the team in mongo.
            const createdTeam: ITeam = await TeamRepository.create(team);

            log(LOG_LEVEL.INFO, parseLogData(AuthController.AUTH_MESSAGES.SUCCESSFULLY_REGISTER,
                                             'AuthController',
                                             '200',
                                             AuthController.AUTH_MESSAGES.NO_STACK));

            return res.status(200).send({ createdTeam, auth: true });
        }

        log(LOG_LEVEL.INFO, parseLogData(AuthController.AUTH_MESSAGES.INVALID_PARAMETER,
                                         'AuthController',
                                         '400',
                                         AuthController.AUTH_MESSAGES.NO_STACK));

        throw new InvalidParameter(AuthController.AUTH_MESSAGES.INVALID_PARAMETER);
    }

    /**
     * Checks if the given token in the authorization header is valid.
     * @param req - Request
     * @param res - Response
     * @param next - NextFunciton
     */
    public static async authorize(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];

        // If the token wasn't in the authorization header.
        if (!token) {
            log(LOG_LEVEL.WARN, parseLogData(AuthController.AUTH_MESSAGES.UNAUTHORIZED_NO_TOKEN,
                                             'AuthController',
                                             '401',
                                             AuthController.AUTH_MESSAGES.NO_STACK));

            throw new Unauthorized(AuthController.AUTH_MESSAGES.UNAUTHORIZED_NO_TOKEN);
        }

        try {
            // Check if the token is valid and use the token's ID to find the specified team.
            req.person = await jwt.verify(token, AuthController.publicKeyOfClient.toString(), { algorithms: ['RS256'] });

            next();
        } catch (err) {
            log(LOG_LEVEL.WARN, parseLogData(AuthController.AUTH_MESSAGES.UNAUTHORIZED_BAD_TOKEN,
                                             'AuthController',
                                             '401',
                                             err));

            throw new Unauthorized(AuthController.AUTH_MESSAGES.UNAUTHORIZED_BAD_TOKEN);
        }
    }

    /**
     * Logins to a given teamname and password.
     * Also, generates a JWT for the login.
     * @param req - Request
     * @param res - Response
     * @param next - Next
     */
    /*public static async login(req: Request, res: Response) {
        const teamReturned: ITeam | null = await TeamRepository.findByTeamname(req.body.team.teamname.toLowerCase());

        if (teamReturned) {
            log(LOG_LEVEL.INFO, parseLogData(AuthController.AUTH_MESSAGES.SUCCESSFULLY_TEAM_CREATE,
                                             'AuthController',
                                             '200',
                                             AuthController.AUTH_MESSAGES.NO_STACK));

            return res.status(200).send({ token, auth: true });
        }

        log(LOG_LEVEL.INFO, parseLogData(AuthController.AUTH_MESSAGES.INVALID_CREDENTIALS,
                                         'AuthController',
                                         '401',
                                         AuthController.AUTH_MESSAGES.NO_STACK));

        // For the seek of information gathering techniques, we shouldn't give the user
        // information if he entered right teamname.
        throw new Unauthorized(AuthController.AUTH_MESSAGES.INVALID_CREDENTIALS);
    }*/

    /**
     * Logout from a team.
     * @param req - Request
     * @param res - Response
     * @param next - NextFunction
     */
    public static async logout(req: Request, res: Response) {
        res.status(200).send({ auth: false, token: null });
    }
}
