const { v4: uuidv4 } = require("uuid");
const { readDb, writeDb } = require("../config/db");

// Generic helpers ------------------------------------------------------

function all(collection) {
  const db = readDb();
  return db[collection] || [];
}

function findById(collection, id) {
  return all(collection).find((item) => item.id === id) || null;
}

function findOne(collection, predicate) {
  return all(collection).find(predicate) || null;
}

function findMany(collection, predicate) {
  return all(collection).filter(predicate);
}

function insert(collection, item) {
  const db = readDb();
  const newItem = { id: uuidv4(), createdAt: new Date().toISOString(), ...item };
  db[collection].push(newItem);
  writeDb(db);
  return newItem;
}

function updateById(collection, id, updates) {
  const db = readDb();
  const index = db[collection].findIndex((item) => item.id === id);
  if (index === -1) return null;
  db[collection][index] = { ...db[collection][index], ...updates };
  writeDb(db);
  return db[collection][index];
}

function removeById(collection, id) {
  const db = readDb();
  const before = db[collection].length;
  db[collection] = db[collection].filter((item) => item.id !== id);
  writeDb(db);
  return db[collection].length < before;
}

module.exports = {
  all,
  findById,
  findOne,
  findMany,
  insert,
  updateById,
  removeById,
};
