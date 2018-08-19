// auth.controller

import { Request, Response, NextFunction } from 'express';
import { UserValidator } from '../user/user.validator';
import { UserRepository } from '../user/user.repository';
import { IUser } from '../user/user.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';

export class AuthController {

    /**
     * Register a new user to the mongo, and generates a JWT
     * for the session of the current user. (As a login)
     * @param req - Request
     * @param res - Response
     */
    public static async register(req: Request, res: Response) {
        const user = req.body.user as IUser;

        // Encrypting the password with bcrypt.
        user.password = bcrypt.hashSync(user.password, 8);

        // If all the validators pass.
        if (UserValidator.isValid(user)) {
            let createdUser: IUser;

            try {
                // Calls the function that creates the user in mongo.
                createdUser = await UserRepository.create(user);
            } catch (err) {
                return res.status(500).send({ auth: false, message: 'Error in creating user' });
            }

            // Sign the JWT token for a specified period of time (In seconds).
            const token = jwt.sign({ id: createdUser._id }, config.secret, {
                expiresIn: 600,
            });

            return res.status(200).send({ token, auth: true });
        }

        return res.status(500).send({ error: 'Error creating user' });
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
            // Check if the token is valid and use the token's ID to find the specified user.
            const jwtVerify: any = await jwt.verify(token, config.secret);
            const returnedUser: IUser | null = await UserRepository.findById(jwtVerify.id);

            return res.status(200).send(returnedUser);
        } catch (err) {
            return res.status(500).send({ auth: false, message: err.message });
        }
    }

    /**
     * Logins to a given username and password.
     * Also, generates a JWT for the login.
     * @param req - Request
     * @param res - Response
     * @param next - Next
     */
    public static async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Find the user in the mongo by the username given in the request body.
            const userReturned: IUser | null = await UserRepository.findByUsername(req.body.user.username);

            if (userReturned) {
                // Checks if the password is correct, using bcrypt compareSync function.
                const passwordIsValid = bcrypt.compareSync(req.body.user.password, userReturned.password);

                if (!passwordIsValid) {
                    return res.status(401).send({ auth: false, token: null });
                }

                // Generate a JWT token.
                const token = jwt.sign({ id: userReturned._id }, config.secret, { expiresIn: 600 });

                return res.status(200).send({ token, auth: true });
            }
            return res.status(404).send({ auth: false, message: 'No user found.' });

        } catch (err) {
            return res.status(404).send({ auth: false, message: 'No user found.' });
        }
    }

    /**
     * Logout from a user.
     * @param req - Request
     * @param res - Response
     * @param next - NextFunction
     */
    public static async logout(req: Request, res: Response, next: NextFunction) {
        res.status(200).send({ auth: false, token: null });
    }
}
