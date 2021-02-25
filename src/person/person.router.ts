// person.router

import { Router } from 'express';
import { PersonController } from './person.controller';
import { Wrapper } from '../utils/wrapper';

export class PersonRouter {

    get router() {
        const router: Router = Router();
        router.get('/:id', Wrapper.wrapAsync(PersonController.getPersonById));
        router.get('/', Wrapper.wrapAsync(PersonController.getPersonsByName));
        router.post('/', Wrapper.wrapAsync(PersonController.getPersonsByList));
        return router;
    }
}
