// team.model

import { model, Schema } from 'mongoose';
import { ITeam } from './team.interface';
import { TeamValidator } from './team.validator';
import { hashSync } from 'bcrypt';

const TeamSchema = new Schema({
    teamname: {
        type: String,
        unique: true,
        required: true,
        validate: [TeamValidator.isTeamnameValid, 'Teamname isn\'t valid'],
    },
    password: {
        type: String,
        required: true,
    },
});

/**
 * Generates hash for password given
 * @param password - password to hash
 */
const generatePasswordHash = (password: string) => {
    return hashSync(password, 8);
};

// Before saving, hashing the password saved
TeamSchema.pre<ITeam>('save', function save() {
    this.password = generatePasswordHash(this.password);
});

// Before updating, hashing the updated password (if needed)
TeamSchema.pre('update', function update(next) {

    // Check if not need to update password
    const password = this.getUpdate().$set.password;
    if (!password) {
        return next();
    }

    this.getUpdate().$set.password = generatePasswordHash(password);
    return next();
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

export const TeamModel = model<ITeam>('Team', TeamSchema);
