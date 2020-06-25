// team.router

import { Router } from 'express';
import { TeamController } from './team.controller';
import { Wrapper } from '../utils/wrapper';

export class TeamRouter {

    get router() {
        const router: Router = Router();
        router.get('/:personid', Wrapper.wrapAsync(TeamController.findByUserId));
        router.put('/', Wrapper.wrapAsync(TeamController.update));
        router.post('/', Wrapper.wrapAsync(TeamController.create));
        router.delete('/:id', Wrapper.wrapAsync(TeamController.delete));

        return router;
    }
}
