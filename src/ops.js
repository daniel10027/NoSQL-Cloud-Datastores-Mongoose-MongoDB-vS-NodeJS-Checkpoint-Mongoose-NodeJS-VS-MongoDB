const Person = require('./models/person');

// Helper to bridge async/await to Node-style callback
const toDone = (done, promise) =>
  promise.then((data) => done(null, data)).catch((err) => done(err));

// 1) Create & Save a single Person
function createAndSavePerson(done) {
  const person = new Person({
    name: 'Alice',
    age: 28,
    favoriteFoods: ['sushi', 'burritos']
  });
  return toDone(done, person.save()); // v8: save() returns a Promise
}

// 2) Create Many Records
function createManyPeople(arrayOfPeople, done) {
  return toDone(done, Person.create(arrayOfPeople)); // returns Promise
}

// 3) Find all people by name
function findPeopleByName(personName, done) {
  return toDone(done, Person.find({ name: personName })); // Query is thenable
}

// 4) Find one person by a favorite food
function findOneByFood(food, done) {
  return toDone(done, Person.findOne({ favoriteFoods: food }));
}

// 5) Find person by _id
function findPersonById(personId, done) {
  return toDone(done, Person.findById(personId));
}

// 6) Classic update: find -> edit -> save
function findEditThenSave(personId, done) {
  (async () => {
    const foodToAdd = 'hamburger';
    const person = await Person.findById(personId);
    if (!person) throw new Error('Person not found');
    person.favoriteFoods.push(foodToAdd);
    return person.save();
  })()
    .then((updated) => done(null, updated))
    .catch((err) => done(err));
}

// 7) findOneAndUpdate: set age=20 by name, return updated doc
function findAndUpdate(personName, done) {
  return toDone(
    done,
    Person.findOneAndUpdate({ name: personName }, { age: 20 }, { new: true })
  );
}

// 8) Delete one by id
function removeById(personId, done) {
  // v8: use findByIdAndDelete instead of findByIdAndRemove
  return toDone(done, Person.findByIdAndDelete(personId));
}

// 9) Delete many named "Mary"
// v8: Model.remove is gone; use deleteMany (returns { acknowledged, deletedCount })
function removeManyPeople(done) {
  return toDone(done, Person.deleteMany({ name: 'Mary' }));
}

// 10) Chain helpers: like burritos, sort by name, limit 2, hide age
function queryChain(done) {
  return toDone(
    done,
    Person.find({ favoriteFoods: 'burritos' }).sort('name').limit(2).select('-age').exec()
  );
}

module.exports = {
  Person,
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
};
