// client.router

import { Router } from 'express';
import { Wrapper } from '../utils/wrapper';
import { ClientController } from './client.controller';

export class ClientRouter {
    get router() {
        const router: Router = Router();
        router.get('/', Wrapper.wrapAsync(ClientController.findByToken));
        router.get('/:clientId', Wrapper.wrapAsync(ClientController.read));
        router.put('/:clientId', Wrapper.wrapAsync(ClientController.update));
        router.post('/', Wrapper.wrapAsync(ClientController.create));
        router.patch('/:clientId', Wrapper.wrapAsync(ClientController.reset));
        router.delete('/:clientId', Wrapper.wrapAsync(ClientController.delete));

        return router;
    }
}
