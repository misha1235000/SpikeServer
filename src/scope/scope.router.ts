// scope.router

import { Router } from 'express';
import { Wrapper } from '../utils/wrapper';
import { ScopeController } from './scope.controller';

export class ScopeRouter {
    get router() {
        const router: Router = Router();

        router.get('/', Wrapper.wrapAsync(ScopeController.findByToken));
        router.get('/:scopeId', Wrapper.wrapAsync(ScopeController.findById));
        router.post('/', Wrapper.wrapAsync(ScopeController.create));
        router.put('/', Wrapper.wrapAsync(ScopeController.update));
        router.delete('/:scopeId', Wrapper.wrapAsync(ScopeController.delete));

        return router;
    }
}
