import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { UserController } from '../user/user.controller';
import { Wrapper } from '../utils/warpper';
import { AuthController } from './auth.controller';
import { IUser } from '../user/user.interface';

export class AuthRouter {

    get router() {
        const router: Router = Router();
        router.use((user: IUser, req: Request, res: Response, next: NextFunction) => {
            res.status(200).send(user);
        });
        router.post('/register', Wrapper.wrapAsync(AuthController.register));
        router.get('/', Wrapper.wrapAsync(AuthController.authorize));
        /*router.get('/:id', Wrapper.wrapAsync(UserController.findById));
        router.put('/:id', Wrapper.wrapAsync(UserController.update));
        router.post('/', Wrapper.wrapAsync(UserController.create));
        router.delete('/:id', Wrapper.wrapAsync(UserController.delete));*/

        return router;
    }
}