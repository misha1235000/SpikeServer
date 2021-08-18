// team.model

import { model, Schema } from 'mongoose';
import { ITeam } from './team.interface';
import { TeamValidator } from './team.validator';
import { MissingUsers } from './team.error';

const TeamSchema = new Schema({
    ownerId: {
        type: String,
        unique: false,
        required: true,
    },
    userIds: {
        type: [String],
        required: false,
        validate: [TeamValidator.isUserIdsValid, ''],
    },
    adminIds: {
        type: [String],
        required: true,
        validate: [TeamValidator.isUserIdsValid, ''],
    },
    teamname: {
        type: String,
        unique: true,
        required: true,
        validate: [TeamValidator.isTeamnameValid, 'Teamname isn\'t valid'],
    },
    desc: {
        type: String,
        required: false,
    },
    contactUserId: {
        type: String,
        required: true,
        validate: [TeamValidator.isContactUserIdValid, '']
    }
});

// Virtual field for getting all the clients of specific team
// Used via population as described in https://mongoosejs.com/docs/populate.html#populate-virtuals
TeamSchema.virtual('clients', {
    ref: 'Client',
    localField: '_id',
    foreignField: 'teamId',
    justOne: false,
    options: { sort: { name: -1 } },
});

TeamSchema.pre<ITeam>('validate', function validate(this: ITeam, next: any) {

    let error = null;

    // Checking if the update make the team become empty
    if ((this.userIds && this.userIds.length === 0) && (this.adminIds && this.adminIds.length === 0)) {
        error = new MissingUsers('Cannot update team without users');
    }

    next(error);
});

export const TeamModel = model<ITeam>('Team', TeamSchema);
