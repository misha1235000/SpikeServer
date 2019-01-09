// team.repository.spec

import * as mongoose from 'mongoose';
import * as chai from 'chai';
import { TeamRepository } from './team.repository';
import { ITeam } from './team.interface';
import { config } from '../config';

const expect = chai.expect;

describe('Team Repository Tests', () => {
    before(async () => {
        await mongoose.connect(config.testDatabaseUrl, { useNewUrlParser: true });
        if (mongoose.connection.collections.teams) {
            await mongoose.connection.collections.teams.remove({});
        }
    });

    afterEach(async () => {
        if (mongoose.connection.collections.teams) {
            await mongoose.connection.collections.teams.remove({});
        }
    });

    describe('create()', () => {
        it('Should return teamname validation error', async () => {
            const teamObject: any = { teamname: '', password: 'Test123!' };

            try {
                const createdTeam = await TeamRepository.create(teamObject);
            } catch (error) {
                expect(error).to.have.property('name', 'ValidationError');
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('teamname');
            }
        });

        it('Should return password validation error', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: '' };

            try {
                const createdTeam = await TeamRepository.create(teamObject);
            } catch (error) {
                expect(error).to.have.property('name', 'ValidationError');
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('password');
            }
        });

        it('Should return password and teamname validation error', async () => {
            const teamObject: any = { teamname: '', password: '' };

            try {
                const createdTeam = await TeamRepository.create(teamObject);
            } catch (error) {
                expect(error).to.have.property('name', 'ValidationError');
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('teamname');
                expect(error.errors).to.have.property('password');
            }
        });

        it('Should create new team successfully', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };

            const createdTeam = await TeamRepository.create(teamObject);
            expect(createdTeam).to.have.property('id');
            expect(createdTeam).to.have.property('teamname', 'TestTeamRepo');
            expect(createdTeam.password).to.not.equal('Test123!');
        });

        it('Should return duplicate error', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };

            await TeamRepository.create(teamObject);

            try {
                await TeamRepository.create(teamObject);
            } catch (error) {
                expect(error).to.have.property('name', 'DuplicateUnique');
            }
        });
    });

    describe('findById()', () => {
        it('Should find an existing team by id successfully', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.have.property('id');

            const foundTeam: any = await TeamRepository.findById(createdTeam.id);

            expect(foundTeam).to.have.property('id', createdTeam.id);
            expect(foundTeam).to.have.property('teamname', 'TestTeamRepo');
        });

        it('Should return null and not find anything', async () => {
            const foundTeam: any = await TeamRepository.findById(mongoose.Types.ObjectId().toHexString());
            expect(foundTeam).to.be.null;
        });

        it('Should return objectId cast error (wrong objectid)', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.not.be.null;

            try {
                await TeamRepository.findById('invalidobjectidtest');
            } catch (error) {
                expect(error).to.have.property('name', 'CastError');
                expect(error).to.have.property('kind', 'ObjectId');
            }
        });

        it('Should return objectId cast error (empty id)', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.not.be.null;

            try {
                await TeamRepository.findById('');
            } catch (error) {
                expect(error).to.have.property('name', 'CastError');
                expect(error).to.have.property('kind', 'ObjectId');
            }
        });
    });

    describe('findByTeamName()', () => {
        it('Should find an existing team by teamname successfully', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.not.be.null;
            expect(createdTeam).to.have.property('teamname');

            const foundTeam: any = await TeamRepository.findByTeamname(createdTeam.teamname);

            expect(foundTeam).to.have.property('teamname', createdTeam.teamname);
            expect(foundTeam.teamname).to.equal('TestTeamRepo');
        });

        it('Should return null and not find anything (Wrong teamname)', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.not.be.null;

            const foundTeam: any = await TeamRepository.findByTeamname('notexistingteam');

            expect(foundTeam).to.be.null;
        });

        it('Should return null and not find anything (Empty teamname)', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.not.be.null;

            const foundTeam: any = await TeamRepository.findByTeamname('');

            expect(foundTeam).to.be.null;
        });
    });

    describe('delete()', () => {
        it('Should delete an existing team by id successfully', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.not.be.null;
            expect(createdTeam).to.have.property('id');

            const deletedTeam: any = await TeamRepository.delete(createdTeam.id);

            expect(deletedTeam).to.not.be.null;

            const foundTeam: any = await TeamRepository.findById(createdTeam.id);

            expect(foundTeam).to.be.null;
        });

        it('Should not delete anything (empty id)', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.not.be.null;

            try {
                await TeamRepository.delete('');
            } catch (error) {
                expect(error).to.have.property('name', 'CastError');
                expect(error).to.have.property('kind', 'ObjectId');
            }
        });

        it('Should return ObjectID Cast Error', async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            const createdTeam = await TeamRepository.create(teamObject);

            expect(createdTeam).to.not.be.null;

            try {
                await TeamRepository.delete('badcastobjectidtest');
            } catch (error) {
                expect(error).to.have.property('name', 'CastError');
                expect(error).to.have.property('kind', 'ObjectId');
            }
        });

        it('Should not delete anything (not existing objectid)', async () => {
            const foundTeam: any = await TeamRepository.findById(mongoose.Types.ObjectId().toHexString());

            expect(foundTeam).to.be.null;
        });
    });

    describe('update()', () => {
        let createdTeam: any;

        beforeEach(async () => {
            const teamObject: any = { teamname: 'TestTeamRepo', password: 'Test123!' };
            createdTeam = await TeamRepository.create(teamObject);
        });

        it('Should update team name successfully', async () => {
            createdTeam.teamname = 'TestTeamUpdated';
            await TeamRepository.update(createdTeam.id, createdTeam);

            const foundTeam: any = await TeamRepository.findById(createdTeam.id);

            expect(foundTeam).to.have.property('teamname', 'TestTeamUpdated');
        });

        it('Should return cast error on empty object id', async () => {
            try {
                createdTeam.teamname = 'TestTeamUpdated';
                await TeamRepository.update('', createdTeam);
            } catch (error) {
                expect(error).to.have.property('name', 'CastError');
                expect(error).to.have.property('kind', 'ObjectId');
            }
        });

        it('Should return null on team not found to update', async () => {
            createdTeam.teamname = 'TestTeamUpdated';

            const updatedTeam = await TeamRepository.update(mongoose.Types.ObjectId().toHexString(), createdTeam);

            expect(updatedTeam).to.be.null;
        });

        it('Should return teamname not valid error', async () => {
            createdTeam.teamname = '';

            try {
                await TeamRepository.update(createdTeam.id, createdTeam);
            } catch (error) {
                expect(error).to.have.property('name', 'ValidationError');
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('teamname');
            }
        });
    });
});
