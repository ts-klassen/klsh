// FS emulator on top of IndexedDB (in-browser or Node via fake-indexeddb)
// In Node environments without indexedDB, load a shim
if (typeof indexedDB === 'undefined' && typeof require === 'function') {
  require('fake-indexeddb/auto');
}
const DB_NAME = 'klsh_files';
const STORE_NAME = 'files';

let dbPromise = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = event => resolve(event.target.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

// Read a file's contents; rejects with Error('ENOENT') if not found
async function readFile(path) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(path);
    req.onsuccess = event => {
      const val = event.target.result;
      if (val === undefined) {
        const err = new Error(`ENOENT: no such file or directory, open '${path}'`);
        err.code = 'ENOENT';
        reject(err);
      } else {
        resolve(val);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

// Write data (string) to a file (overwrites existing)
async function writeFile(path, data) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(data, path);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Delete a file
async function unlink(path) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(path);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

module.exports = { readFile, writeFile, unlink };