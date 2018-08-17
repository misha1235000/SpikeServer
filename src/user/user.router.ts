import { Router } from 'express';
import { UserController } from './user.controller';
import { Wrapper } from '../utils/warpper';

export class UserRouter {

    get router() {
        const router: Router = Router();
        router.get('/:id', Wrapper.wrapAsync(UserController.findById));
        router.put('/:id', Wrapper.wrapAsync(UserController.update));
        router.post('/', Wrapper.wrapAsync(UserController.create));
        router.delete('/:id', Wrapper.wrapAsync(UserController.delete));

        return router;
    }
}
