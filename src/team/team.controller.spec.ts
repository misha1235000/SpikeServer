// team.spec

import * as mongoose from 'mongoose';
import * as chai from 'chai';
// import { Server } from '../server';
/*
const chaiHttp = chai.use(require('chai-http'));
const expect = chai.expect;
const should = chai.should;

describe('Register a new team', () => {
    before(async() => {
        const mongoCon = await mongoose.connect('mongodb://test:test123@ds123584.mlab.com:23584/spikeservertest');
        await mongoCon.connection.db.dropDatabase();
    });

    it('Should return error missing team parameter', async () => {
        const team = await {
            teamname: 'SpikeTestTeam',
            password: 'Test123!',
        };

        const res = await chai.request(Server)
                              .post('/api/auth/register')
                              .send(team);
        expect(res.body).to.have.property('message');
        expect(res.status).to.equal(400);
        await Promise.resolve();
    });

    it('Should create a new team successfully', async () => {
        const team = await {
            team: {
                teamname: 'SpikeTestTeam',
                password: 'Test123!',
            },
        };

        const res = await chai.request(Server)
                              .post('/api/auth/register')
                              .send(team);
        expect(res.status).to.equal(200);
        expect(res.body.auth).to.be.equal(true);
        await Promise.resolve();
    });

    it('Should return duplicate on team creation', async () => {
        const team = await {
            team: {
                teamname: 'SpikeTestTeam',
                password: 'Test123!',
            },
        };

        const res = await chai.request(Server)
                              .post('/api/auth/register')
                              .send(team);
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('message');
        await Promise.resolve();
    });
});
/*
describe('Update a team', () => {
    it('Should update an existing team', () => {
        // TeamController.update()
        expect(1).to.equal(1);
    });
});

describe('Delete a team', () => {
    it('Should delete an existing team successfully', () => {

    });
});*/
