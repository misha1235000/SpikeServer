// client.router

import { Router } from 'express';
import { Wrapper } from '../utils/wrapper';
import { ClientController } from './client.controller';

export class ClientRouter {
    get router() {
        const router: Router = Router();
        router.get('/dashboard', Wrapper.wrapAsync(ClientController.getAllClients));
        router.get('/search', Wrapper.wrapAsync(ClientController.searchByName));
        router.get('/', Wrapper.wrapAsync(ClientController.findByToken));
        router.get('/:clientId', Wrapper.wrapAsync(ClientController.read));
        router.get('/:clientId/tokens', Wrapper.wrapAsync(ClientController.getClientActiveTokens));
        router.get('/:clientId/scopes', Wrapper.wrapAsync(ClientController.getClientPermittedScopes));
        router.put('/:clientId', Wrapper.wrapAsync(ClientController.update));
        router.post('/search', Wrapper.wrapAsync(ClientController.findByIds));
        router.post('/', Wrapper.wrapAsync(ClientController.create));
        router.patch('/:clientId', Wrapper.wrapAsync(ClientController.reset));
        router.delete('/:clientId', Wrapper.wrapAsync(ClientController.delete));

        return router;
    }
}
