require('dotenv').config();
const mongoose = require('mongoose');
const fuzzySearching = require('mongoose-fuzzy-searching');
const fuzzyCollections = require('./config').fuzzyCollections;

const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    //    validate: [ClientValidator.isNameValid, 'Name isn\'t valid'],
    },
    clientId: {
        type: String,
        unique: true,
        required: true,
    //    validate: [ClientValidator.isClientIdValid, 'Client ID isn\'t valid'],
    },
    audienceId: {
        type: String,
        unique: true,
        required: true,
    //    validate: [ClientValidator.isAudienceIdValid, 'Audience ID isn\'t valid'],
    },
    teamId: {
        type: String,
        ref: 'Team',
        required: true,
      /*  validate: {
            isAsync: true,
            validator: ClientValidator.isTeamIdValid,
            message: 'TeamId isn\'t valid',
        },*/
    },
    hostUris: {
        type: [String],
        unique: true,
        required: true,
      //  validate: [ClientValidator.isHostnameValid, 'Hostname isn\'t valid'],
    },
    token: {
        type: String,
        unique: true,
        required: true,
       // validate: [ClientValidator.isTokenValid, 'Token isn\'t valid'],
    },
});

ClientSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    delete obj.token;
    return obj;
};

ClientSchema.plugin(fuzzySearching, { fields: ['name'] });

const ClientModel = mongoose.model('Client', ClientSchema);


// Update model by the specified fields to use fuzzy search
async function updateFuzzy(modelName, attrs) {    
    const collections = await mongoose.model(modelName).find();
    console.log(collections);
    for (const doc of collections) {
        const obj = attrs.reduce((acc, attr) => ({ ...acc, [attr]: doc[attr] }), {});        
        await mongoose.model(modelName).findOneAndUpdate({ _id: doc._id }, { $set: obj });
    }
};

// Update all collections fields to support fuzzy searching
(async function() {
    await mongoose.connect(
        `mongodb://${process.env.DB_PROD_USER}:${process.env.DB_PROD_PASS}@${process.env.DB_PROD_HOST}/${process.env.DB_PROD_NAME}${process.env.DB_PROD_TYPE || ''}`,
        { useNewUrlParser: true }
    );    
    for (const collection of fuzzyCollections) {
        console.log(`Update ${collection.collectionName}`)
        await updateFuzzy(collection.collectionName, collection.fields);
    }
    console.log('Done updating fuzzy search');
})();

