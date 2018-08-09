import { Router } from 'express';
import { UserController } from './user.controller';
import { Wrapper } from '../utils/warpper';

export class UserRouter {

    get router() {
        const router: Router = Router();
        router.get('/', Wrapper.wrapAsync(UserController.find));
        router.get('/:id', Wrapper.wrapAsync(UserController.findById));
        router.put('/:id', Wrapper.wrapAsync(UserController.update));
        router.post('/', Wrapper.wrapAsync(UserController.create));
        router.delete('/:id', Wrapper.wrapAsync(UserController.delete));

        return router;
    }
}
/*









import * as express from 'express';
var router = express.Router();

import { UserModel } from './user.model';
import { User } from './user.interface';
import { Error } from 'mongoose';

// CREATES A NEW USER
router.post('/', (req: express.Request, res: express.Response) => {
    UserModel.create({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password
        }, 
        (err: Error, user: User) => {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            return res.status(200).send(user);
        });
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', (req: express.Request, res: express.Response) => {
    UserModel.find({}, (err: Error, users: User[]) => {
        if (err) return res.status(500).send("There was a problem finding the users.");
        return res.status(200).send(users);
    });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', (req: express.Request, res: express.Response) => {
    UserModel.findById(req.params.id, (err: Error, user: User) => {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        return res.status(200).send(user);
    });
});

export const UserRoutes = router;*/