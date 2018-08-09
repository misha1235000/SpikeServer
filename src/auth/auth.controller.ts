// AuthController

import { NextFunction } from "../../node_modules/@types/connect";
import { Error } from "mongoose";
import { UserModel } from "../user/user.model";
import * as express from 'express';
import { Request, Response } from 'express';
import { IUser } from "../user/user.interface";
import * as jwt from 'jsonwebtoken';
import { VerifyToken } from './auth.token';
import * as bcrypt from 'bcrypt';
import { config } from '../config';

const router = express.Router();

router.post('/register', (req: Request, res: Response) => {
    let hashedPassword = bcrypt.hashSync(req.body.password, 8);

    UserModel.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    },
    (err: Error, user: IUser) => {
        if (err) {
            return res.status(500).send("There was a problem registering the user.");
        }

        // Create a token
        let token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 60 // 24 Hours
        })

        return res.status(200).send({ auth: true, token: token });
    });
});

router.get('/', VerifyToken, (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided.' }).redirect('/');
    }

    jwt.verify(token, config.secret, (err: Error, decoded: any) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }).redirect('/');
        }
        
        UserModel.findById(decoded.id, 
        { password: 0, _id: 0, name: 0},
        (err: Error, user: IUser) => {
            if (err) {
                return res.status(500).send("There was a problem finding the user.");
            }

            if (!user) {
                return res.status(404).send("No user found.");
            }

            return next(user);
        });
    });
});

// Middleware function
router.use((user: IUser, req: Request, res: Response, next: NextFunction) => {
    res.status(200).send(user);
});

router.post('/login', (req: Request, res: Response) => {
    UserModel.findOne({ email: req.body.email }, (err: Error, user: IUser) => {
      if (err) {
          return res.status(500).send('Error on the server.');
      }
      if (!user) {
          return res.status(404).send('No user found.');
      }

      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

      if (!passwordIsValid) {
          return res.status(401).send({ auth: false, token: null });
      }

      let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      return res.status(200).send({ auth: true, token: token });
    });
});

router.get('/logout', (req: Request, res: Response) => {
    res.status(200).send({ auth: false, token: null });
});

export const AuthController = router;