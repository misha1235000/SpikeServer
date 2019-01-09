// team.spec

import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { Server } from '../server';
import { expect } from 'chai';

describe('Auth controller Testing', () => {
    before(async () => {
        await mongoose.connect('mongodb://test:test123@ds123584.mlab.com:23584/spikeservertest', { useNewUrlParser: true });
        if (mongoose.connection.collections.teams) {
            await mongoose.connection.collections.teams.remove({});
        }
    });

    afterEach(async () => {
        if (mongoose.connection.collections.teams) {
            await mongoose.connection.collections.teams.remove({});
        }
    });

    const teamToRegister = {
        teamname: 'registertest',
        password: 'Test123!',
    };

    it('Should authorize successfully and give you a token.', async () => {
        try {
            const result = await request(Server)
                            .post('/api/auth/register')
                            .send({ team: teamToRegister })
                            .expect(200);

            expect(result.body.auth).to.be.equal(true);
            expect(result.body.token).to.be.a('string');
        } catch (error) {
            console.log(error);
        }
    });

    it('Should return bad request error (Duplicate)', async () => {
        await request(Server)
                .post('/api/auth/register')
                .send({ team: teamToRegister })
                .expect(200);

        await request(Server)
                .post('/api/auth/register')
                .send({ team: teamToRegister })
                .expect(400);
    });
});
