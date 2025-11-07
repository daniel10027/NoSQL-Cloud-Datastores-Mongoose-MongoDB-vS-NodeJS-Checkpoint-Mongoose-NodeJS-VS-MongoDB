// src/demo.js
// A runnable script that connects to DB, executes every checkpoint function,
// logs results, and closes the connection gracefully.

const { connectDB, closeDB } = require('./db');
const {
    createAndSavePerson,
    createManyPeople,
    findPeopleByName,
    findOneByFood,
    findPersonById,
    findEditThenSave,
    findAndUpdate,
    removeById,
    removeManyPeople,
    queryChain
} = require('./ops');

// Small helper to use callback-based functions in sequence
const run = (fn, ...args) =>
    new Promise((resolve, reject) =>
        fn(...args, (err, data) => (err ? reject(err) : resolve(data)))
    );

(async() => {
    await connectDB();

    try {
        // 1) Create one
        const one = await run(createAndSavePerson);
        console.log('Created one:', one.toObject());

        // 2) Create many
        const many = await run(createManyPeople, [
            { name: 'John', age: 25, favoriteFoods: ['pizza', 'burritos'] },
            { name: 'Mary', age: 31, favoriteFoods: ['salad'] },
            { name: 'John', age: 40, favoriteFoods: ['burritos', 'steak'] }
        ]);
        console.log('Created many (count):', many.length);

        // 3) Find by name
        const johns = await run(findPeopleByName, 'John');
        console.log('Find by name (John):', johns.map(d => d._id.toString()));

        // 4) Find one by favorite food
        const burritoLover = await run(findOneByFood, 'burritos');
        console.log('Find one who likes burritos:', burritoLover ?.name);
        // 5) Find by id
        const byId = await run(findPersonById, one._id);
        console.log('Find by id:', byId ?.name);

        // 6) Classic update (push hamburger)
        const updated = await run(findEditThenSave, one._id);
        console.log('Classic update, foods:', updated.favoriteFoods);

        // 7) findOneAndUpdate name -> age=20
        const johnUpdated = await run(findAndUpdate, 'John');
        console.log('John after age=20:', johnUpdated ?.age);

        // 8) Delete by id (remove the first created person)
        const removed = await run(removeById, one._id);
        console.log('Removed by id:', removed ?._id ?.toString());

        // 9) Delete many "Mary"
        const removedMary = await run(removeManyPeople);
        console.log('Remove Mary result:', removedMary);

        // 10) Query chain (limit 2, hide age)
        const chain = await run(queryChain);
        console.log('Query chain result:', chain.map(d => d.toObject()));
    } catch (e) {
        console.error('Demo error:', e);
    } finally {
        await closeDB();
    }
})();