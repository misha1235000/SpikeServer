// auth.router

import { Router } from 'express';
import { Wrapper } from '../utils/wrapper';
import { AuthController } from './auth.controller';

export class AuthRouter {
    get router() {
        const router: Router = Router();
        router.post('/register', Wrapper.wrapAsync(AuthController.register));
        router.post('/login', Wrapper.wrapAsync(AuthController.login));
        router.get('/logout', Wrapper.wrapAsync(AuthController.logout));

        return router;
    }
}
