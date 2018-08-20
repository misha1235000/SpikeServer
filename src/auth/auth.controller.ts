// auth.controller

import { Request, Response, NextFunction } from 'express';
import { TeamValidator } from '../team/team.validator';
import { TeamRepository } from '../team/team.repository';
import { ITeam } from '../team/team.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';

export class AuthController {

    /**
     * Register a new team to the mongo, and generates a JWT
     * for the session of the current team. (As a login)
     * @param req - Request
     * @param res - Response
     */
    public static async register(req: Request, res: Response) {
        const team = req.body.team as ITeam;

        // If all the validators pass.
        if (TeamValidator.isValid(team)) {
            let createdTeam: ITeam;

            // Encrypting the password with bcrypt.
            team.password = bcrypt.hashSync(team.password, 8);

            try {
                // Calls the function that creates the team in mongo.
                createdTeam = await TeamRepository.create(team);
            } catch (err) {
                return res.status(500).send({ auth: false, message: 'Error in creating team' });
            }

            // Sign the JWT token for a specified period of time (In seconds).
            const token = jwt.sign({ id: createdTeam._id }, config.secret, {
                expiresIn: 600,
            });

            return res.status(200).send({ token, auth: true });
        }

        return res.status(500).send({ error: 'Error creating team' });
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
            return res.status(401).send({ auth: false, message: 'No token provided.' });
        }

        try {
            // Check if the token is valid and use the token's ID to find the specified team.
            const jwtVerify: any = await jwt.verify(token, config.secret);
            const returnedTeam: ITeam | null = await TeamRepository.findById(jwtVerify.id);

            return res.status(200).send(returnedTeam);
        } catch (err) {
            return res.status(500).send({ auth: false, message: err.message });
        }
    }

    /**
     * Logins to a given teamname and password.
     * Also, generates a JWT for the login.
     * @param req - Request
     * @param res - Response
     * @param next - Next
     */
    public static async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Find the team in the mongo by the teamname given in the request body.
            const teamReturned: ITeam | null = await TeamRepository.findByTeamname(req.body.team.teamname);

            if (teamReturned) {
                // Checks if the password is correct, using bcrypt compareSync function.
                const passwordIsValid = bcrypt.compareSync(req.body.team.password, teamReturned.password);

                if (!passwordIsValid) {
                    return res.status(401).send({ auth: false, token: null });
                }

                // Generate a JWT token.
                const token = jwt.sign({ id: teamReturned._id }, config.secret, { expiresIn: 600 });

                return res.status(200).send({ token, auth: true });
            }
            return res.status(404).send({ auth: false, message: 'No team found.' });

        } catch (err) {
            return res.status(404).send({ auth: false, message: 'No team found.' });
        }
    }

    /**
     * Logout from a team.
     * @param req - Request
     * @param res - Response
     * @param next - NextFunction
     */
    public static async logout(req: Request, res: Response, next: NextFunction) {
        res.status(200).send({ auth: false, token: null });
    }
}
