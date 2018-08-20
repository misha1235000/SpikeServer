// team.router

import { Router } from 'express';
import { TeamController } from './team.controller';
import { Wrapper } from '../utils/warpper';

export class TeamRouter {

    get router() {
        const router: Router = Router();
        router.get('/:id', Wrapper.wrapAsync(TeamController.findById));
        router.put('/:id', Wrapper.wrapAsync(TeamController.update));
        router.post('/', Wrapper.wrapAsync(TeamController.create));
        router.delete('/:id', Wrapper.wrapAsync(TeamController.delete));

        return router;
    }
}
