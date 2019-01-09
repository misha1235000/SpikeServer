// client.repository.spec

import * as mongoose from 'mongoose';
import * as chai from 'chai';
import { TeamRepository } from '../team/team.repository';
import { ClientRepository } from './client.repository';
import { config } from '../config';
const expect = chai.expect;

describe('Client Repository Tests', () => {
    let createdTeam: any;

    before(async () => {
        await mongoose.connect(config.testDatabaseUrl, { useNewUrlParser: true });
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

    describe('findById()', () => {
        let createdClient: any;

        beforeEach(async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };

            createdClient = await ClientRepository.create(clientObject);
        });

        it('Should find a client successfully by client id.', async () => {
            const foundClient = await ClientRepository.findById(createdClient.clientId);

            expect(foundClient).to.have.property('name', 'RealTeam');
            expect(foundClient).to.have.property('clientId', 'someclientidhere');
            expect(foundClient).to.have.property('teamId', createdTeam.id);
            expect(foundClient).to.have.property('hostUri', 'https://testclientidhere.com');
            expect(foundClient).to.have.property('token', 'sometokenhere');
        });

        it('Should not find any client (Not existing client id)', async () => {
            const foundClient = await ClientRepository.findById('notexistingclientid');

            expect(foundClient).to.be.null;
        });

        it('Should not find any client (Empty client id)', async () => {
            const foundClient = await ClientRepository.findById('');

            expect(foundClient).to.be.null;
        });
    });

    describe('findByTeamId()', () => {
        let createdClient: any;

        beforeEach(async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };

            createdClient = await ClientRepository.create(clientObject);
        });

        it('Should find one existing client by team id', async () => {
            const foundClient = await ClientRepository.findByTeamId(createdTeam.id);

            expect(foundClient).to.have.property('length', 1);
        });

        it('Should find two existing clients by one team id', async () => {
            const secondClientObject: any = {
                name: 'SecondClient',
                clientId: 'secondclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://secondclientidhere.com',
                token: 'secondtokenhere',
            };

            await ClientRepository.create(secondClientObject);
            const foundClients = await ClientRepository.findByTeamId(createdTeam.id);

            expect(foundClients).to.have.property('length', 2);
        });

        it('Should not find any client (Not existing client id)', async () => {
            const foundClient = await ClientRepository.findByTeamId('notexistingteamid');

            expect(foundClient).to.have.property('length', 0);
        });

        it('Should not find any client (Empty client id)', async () => {
            const foundClient = await ClientRepository.findById('');

            expect(foundClient).to.be.null;
        });
    });

    describe('update()', () => {
        let createdClient: any;

        beforeEach(async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };

            createdClient = await ClientRepository.create(clientObject);
        });

        it('Should update client successfully', async () => {
            const clientUpdate: any = {
                name: 'RealTeamUpdated',
                clientId: 'someclientidupdated',
                teamId: createdTeam.id,
                hostUri: 'https://testclientupdated.com',
                token: 'tokenupdated',
            };

            const updatedClient = await ClientRepository.update(createdClient.clientId, clientUpdate);

            expect(updatedClient).to.have.property('name', 'RealTeamUpdated');
            expect(updatedClient).to.have.property('clientId', 'someclientidupdated');
            expect(updatedClient).to.have.property('hostUri', 'https://testclientupdated.com');
            expect(updatedClient).to.have.property('token', 'tokenupdated');
        });

        it('Should return duplicate error', async () => {
            const secondClientObject: any = {
                name: 'SecondClient',
                clientId: 'secondclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://secondclientidhere.com',
                token: 'secondtokenhere',
            };

            const secondCreatedClient = await ClientRepository.create(secondClientObject);

            expect(secondCreatedClient).to.not.be.null;

            try {
                await ClientRepository.update(secondCreatedClient.clientId, { clientId: 'someclientidhere' });
            } catch (error) {
                expect(error).to.have.property('code', 11000);
            }
        });

        it('Should not update anything (Not existing clientId)', async () => {
            const updatedClient = await ClientRepository.update('notexistingclientidhere', { name: 'ChangeName' });

            expect(updatedClient).to.be.null;
        });

        it('Should return validation error (Bad Values)', async () => {
            const clientUpdate: any = {
                name: null,
                clientId: null,
                teamId: null,
                hostUri: 'http://testclientidhere.com',
                token: null,
            };

            try {
                await ClientRepository.update(createdClient.clientId, clientUpdate);
            } catch (error) {
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('name');
                expect(error.errors).to.have.property('clientId');
                expect(error.errors).to.have.property('teamId');
                expect(error.errors).to.have.property('hostUri');
                expect(error.errors).to.have.property('token');
            }
        });

        it('Should return validation error (Empty Values)', async () => {
            const clientUpdate: any = {
                name: '',
                clientId: '',
                teamId: '',
                hostUri: '',
                token: '',
            };

            try {
                await ClientRepository.update(createdClient.clientId, clientUpdate);
            } catch (error) {
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('name');
                expect(error.errors).to.have.property('clientId');
                expect(error.errors).to.have.property('teamId');
                expect(error.errors).to.have.property('hostUri');
                expect(error.errors).to.have.property('token');
            }
        });
    });

    describe('delete()', () => {
        let createdClient: any;

        beforeEach(async () => {
            const clientObject: any = {
                name: 'RealTeam',
                clientId: 'someclientidhere',
                teamId: createdTeam.id,
                hostUri: 'https://testclientidhere.com',
                token: 'sometokenhere',
            };

            createdClient = await ClientRepository.create(clientObject);
        });

        it('Should delete client succeessfully', async () => {
            await ClientRepository.delete(createdClient.clientId);

            const foundDeletedClient = await ClientRepository.findById(createdClient.clientId);

            expect(foundDeletedClient).to.be.null;
        });

        it('Should not delete anything (Not Existing ClientId)', async () => {
            const deletedClient = await ClientRepository.delete('notexistingclientid');

            expect(deletedClient).to.be.null;
        });

        it('Should not delete anything (Empty ClientId)', async () => {
            const deletedClient = await ClientRepository.delete('');

            expect(deletedClient).to.be.null;
        });
    });
});
