require('dotenv').config();
const mongoose = require('mongoose');
const fuzzyCollections = require('./config').fuzzyCollections;

// Update model by the specified fields to use fuzzy search
async function updateFuzzy(modelName, attrs) {
    const collections = await mongoose.model(modelName).find();
    for (const doc of collections) {
        const obj = attrs.reduce((acc, attr) => ({ ...acc, [attr]: doc[attr] }), {});
        await mongoose.model(modelName).findByIdAndUpdate(doc._id, obj);
    }
};

// Update all collections fields to support fuzzy searching
(async function() {
    await mongoose.connect(
        `mongodb://${process.env.DB_PROD_USER}:${process.env.DB_PROD_PASS}@${process.env.DB_PROD_HOST}/${process.env.DB_PROD_NAME}${process.env.DB_PROD_TYPE || ''}`,
        { useNewUrlParser: true }
    );

    for (const collection of fuzzyCollections) {
        await updateFuzzy(collection.collectionName, collection.fields);
    }
})();

