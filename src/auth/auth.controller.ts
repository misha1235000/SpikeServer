// auth.controller

import { Request, Response, NextFunction } from 'express';
import { TeamValidator } from '../team/team.validator';
import { TeamRepository } from '../team/team.repository';
import { ITeam } from '../team/team.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import { Unauthorized } from './auth.error';
import { InvalidParameter } from '../utils/error';

export class AuthController {

    /**
     * Register a new team to the mongo, and generates a JWT
     * for the session of the current team. (As a login)
     * @param req - Request
     * @param res - Response
     */
    public static async register(req: Request, res: Response) {
        const team = req.body.team as ITeam;
        const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,50}$/;

        // If team parameter provided
        if (team) {
            team.teamname = team.teamname.toLowerCase();

            let createdTeam: ITeam;

            if (TeamValidator.isPasswordValid(team.password)) {

                // Calls the function that creates the team in mongo.
                createdTeam = await TeamRepository.create(team);

                // Sign the JWT token for a specified period of time (In seconds).
                const token = jwt.sign({ id: createdTeam._id }, config.secret as string, {
                    expiresIn: 600,
                });

                return res.status(200).send({ token, auth: true });
            }
        }

        throw new InvalidParameter('team parameter is missing.');
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
            throw new Unauthorized('Unauthorized, No token provided.');
        }

        try {
            // Check if the token is valid and use the token's ID to find the specified team.
            const jwtVerify: any = await jwt.verify(token, config.secret as string); // TODO; Make an interface for decoded jwt.
            const returnedTeam: ITeam | null = await TeamRepository.findById(jwtVerify.id);

            // Check if the token contains existing team
            if (!returnedTeam) {
                throw new Unauthorized('Token signed with unexisting team.');
            }

            req.teamId = jwtVerify.id;

            next();
        } catch (err) {
            throw new Unauthorized('Invalid token provided.');
        }
    }

    /**
     * Logins to a given teamname and password.
     * Also, generates a JWT for the login.
     * @param req - Request
     * @param res - Response
     * @param next - Next
     */
    public static async login(req: Request, res: Response) {
        const teamReturned: ITeam | null = await TeamRepository.findByTeamname(req.body.team.teamname.toLowerCase());

        if (teamReturned) {
            // Checks if the password is correct, using bcrypt compareSync function.
            const passwordIsValid = bcrypt.compareSync(req.body.team.password, teamReturned.password);

            if (!passwordIsValid) {
                throw new Unauthorized('Incorrect teamname or password given.');
            }

            // Generate a JWT token.
            const token = jwt.sign({ id: teamReturned._id }, config.secret as string, { expiresIn: 600 });

            return res.status(200).send({ token, auth: true });
        }

        // For the sick of information gathering techniques, we should'nt give the user
        // information if he entered right teamname.
        throw new Unauthorized('Incorrect teamname or password given.');
    }

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
