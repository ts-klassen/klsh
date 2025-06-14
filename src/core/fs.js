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

module.exports = { readFile, writeFile, unlink, append };

// Append data (string) to an existing file, or create a new file when it doesn't exist.
// The operation is performed within a single readwrite transaction so that the
// read-modify-write cycle is atomic from the IndexedDB point of view.  We avoid
// the read-then-overwrite pattern which could lose concurrent writes when run
// in a multi-tab environment.
async function append(path, data) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // First, fetch the existing value (if any) _within_ the same transaction.
    const getReq = store.get(path);
    getReq.onsuccess = () => {
      const current = getReq.result || '';
      const putReq = store.put(current + data, path);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// (export already included above)