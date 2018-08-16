import { Router } from 'express';
import { Wrapper } from '../utils/warpper';
import { ClientController } from './client.controller';

export class ClientRouter {
    get router() {
        const router: Router = Router();
        router.get('/', Wrapper.wrapAsync(ClientController.findByToken));
        router.put('/', Wrapper.wrapAsync(ClientController.update));
        router.post('/', Wrapper.wrapAsync(ClientController.create));
        router.delete('/:id', Wrapper.wrapAsync(ClientController.delete));

        return router;
    }
}