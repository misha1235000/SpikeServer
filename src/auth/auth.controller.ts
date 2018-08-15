import { Request, Response, NextFunction } from 'express';
import { UserValidator } from '../user/user.validator';
import { UserRepository } from '../user/user.repository';
import { IUser } from '../user/user.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';

export class AuthController {
    public static async register(req: Request, res: Response) {
        let user = req.body.user as IUser;
        user.password = bcrypt.hashSync(user.password, 8);
        if (UserValidator.isValid(user)) {
            let createdUser: IUser;
            try {
                createdUser = await UserRepository.create(user);
            } catch(err) {
                return res.status(500).send({ auth: false, message: 'Error in creating user' });
            }

            const token = jwt.sign({ id: createdUser._id }, config.secret, {
                expiresIn: 600 // 24 Hours
            });
            
            return res.status(200).send({ auth: true, token: token });
        }

        throw new Error("Creation Error.");
    }

    public static async authorize(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        
        if (!token) {
            return res.status(401).send({ auth: false, message: 'No token provided.' });
        }
        
        try {
            const jwtVerify: any = await jwt.verify(token, config.secret);
            const returnedUser: IUser | null = await UserRepository.findById(jwtVerify.id);
            return res.status(200).send(returnedUser);
        } catch(err) {
            return res.status(500).send({ auth: false, message: err.message});
        }
    }

    public static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const userReturned: IUser | null = await UserRepository.findByUsername(req.body.user.username);
            if (userReturned) {
                const passwordIsValid = bcrypt.compareSync(req.body.user.password, userReturned.password);

                if (!passwordIsValid) {
                    return res.status(401).send({auth: false, token: null});
                }

                const token = jwt.sign({ id: userReturned._id }, config.secret, {expiresIn: 600});

                return res.status(200).send({ auth: true, token: token });
            } else {
                return res.status(404).send({ auth: false, message: 'No user found.' });
            }
        } catch(err) {
            return res.status(404).send({ auth: false, message: 'No user found.' });
        }        
    }

    public static async logout(req: Request, res: Response, next: NextFunction) {
        res.status(200).send({ auth: false, token: null });
    }
}