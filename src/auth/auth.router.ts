import { Router } from 'express';
import { } from './auth.token';
import { Wrapper } from '../utils/warpper';
import { AuthController } from './auth.controller';

export class AuthRouter {
    get router() {
        const router: Router = Router();
        router.get('/', Wrapper.wrapAsync(AuthController.authorize));
        router.post('/register', Wrapper.wrapAsync(AuthController.register));
        router.post('/login', Wrapper.wrapAsync(AuthController.login));
        router.get('/logout', Wrapper.wrapAsync(AuthController.logout));
        /*router.post('/', Wrapper.wrapAsync(UserController.create));
        router.delete('/:id', Wrapper.wrapAsync(UserController.delete));*/

        return router;
    }
}