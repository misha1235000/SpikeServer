// team.repository.spec

import * as mongoose from 'mongoose';
import * as chai from 'chai';
import { TeamRepository } from '../team/team.repository';
import { ClientRepository } from './client.repository';

const expect = chai.expect;

describe('Client Repository Tests', () => {
    let createdTeam: any;

    before(async () => {
        await mongoose.connect('mongodb://test:test123@ds123584.mlab.com:23584/spikeservertest', { useNewUrlParser: true });
        if (mongoose.connection.collections.teams) {
            await mongoose.connection.collections.teams.remove({});
        }

        if (mongoose.connection.collections.clients) {
            await mongoose.connection.collections.clients.remove({});
        }
    });

    afterEach(async () => {
        if (mongoose.connection.collections.teams) {
            await mongoose.connection.collections.teams.remove({});
        }

        if (mongoose.connection.collections.clients) {
            await mongoose.connection.collections.clients.remove({});
        }
    });

    beforeEach(async () => {
        const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };

        createdTeam = await TeamRepository.create(teamObject);
    });

    describe('create()', () => {
        it('Should create a client successfully', async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };

            const createdClient = await ClientRepository.create(clientObject);
            const newClient: any = await ClientRepository.findById(createdClient.clientId);

            expect(newClient).to.not.be.null;
            expect(newClient).to.have.property('name', 'RealTeam');
            expect(newClient).to.have.property('clientId', 'someclientidhere');
            expect(newClient).to.have.property('teamId', createdTeam.id);
            expect(newClient).to.have.property('hostUri', 'https://testclientidhere.com');
            expect(newClient).to.have.property('token', 'sometokenhere');
        });

        it('Should return all client validation errors (empty values)', async () => {
            const clientObject: any = {
                name: '',
                clientId: '',
                teamId: '',
                hostUri: '',
                token: '',
            };

            try {
                await ClientRepository.create(clientObject);
            } catch (error) {
                expect(error).to.have.property('name');
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('name');
                expect(error.errors).to.have.property('clientId');
                expect(error.errors).to.have.property('teamId');
                expect(error.errors).to.have.property('hostUri');
                expect(error.errors).to.have.property('token');
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('Should return all client validation errors (wrong regex)', async () => {
            const clientObject: any = {
                name: '!!!!',
                clientId: null,
                teamId: null,
                hostUri: 'http://wronghosturi.com',
                token: null,
            };

            try {
                await ClientRepository.create(clientObject);
            } catch (error) {
                expect(error).to.have.property('name');
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('name');
                expect(error.errors).to.have.property('clientId');
                expect(error.errors).to.have.property('teamId');
                expect(error.errors).to.have.property('hostUri');
                expect(error.errors).to.have.property('token');
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('Should return team id not valid error', async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: mongoose.Types.ObjectId().toHexString(),
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };

            try {
                await ClientRepository.create(clientObject);
            } catch (error) {
                expect(error).to.have.property('name');
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('Should return clientId duplicate error', async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };
            const duplicateClient: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testduplicateclient.com',
                token: 'someothertoken',
            };

            const createdClient = await ClientRepository.create(clientObject);

            expect(createdClient).to.not.be.null;

            try {
                await ClientRepository.create(duplicateClient);
            } catch (error) {
                expect(error).to.have.property('code', 11000);
            }
        });

        it('Should return hostUri duplicate error', async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };
            const duplicateClient: any = {
                name: 'RealTeam',
                clientId: 'otherclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'someothertoken',
            };

            const createdClient = await ClientRepository.create(clientObject);

            expect(createdClient).to.not.be.null;

            try {
                await ClientRepository.create(duplicateClient);
            } catch (error) {
                expect(error).to.have.property('code', 11000);
            }
        });

        it('Should return token duplicate error', async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };
            const duplicateClient: any = {
                name: 'RealTeam',
                clientId: 'otherclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testduplicateclient.com',
                token: 'sometokenhere',
            };

            const createdClient = await ClientRepository.create(clientObject);

            expect(createdClient).to.not.be.null;

            try {
                await ClientRepository.create(duplicateClient);
            } catch (error) {
                expect(error).to.have.property('code', 11000);
            }
        });
    });
});
