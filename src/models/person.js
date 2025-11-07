// Person Prototype:
// name: string [required]
// age: number (default 0)
// favoriteFoods: array of strings (default [])
// Note: We use explicit [String] to keep it typed (not Mixed).

const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    name: { type: String, required: true }, // required validator
    age: { type: Number, default: 0 }, // default value
    favoriteFoods: { type: [String], default: [] }
}, { timestamps: true });

const Person = mongoose.model('Person', personSchema);

module.exports = Person;