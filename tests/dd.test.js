const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('dd', function() {
  // Clear all files in the in-memory IndexedDB store before each test
  beforeEach(async function() {
    await new Promise((resolve, reject) => {
      const openReq = indexedDB.open('klsh_files', 1);
    openReq.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files');
      }
    };
      openReq.onsuccess = () => {
        const db = openReq.result;
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        const clearReq = store.clear();
        clearReq.onsuccess = () => { db.close(); resolve(); };
        clearReq.onerror = () => { db.close(); reject(clearReq.error); };
      };
      openReq.onerror = () => reject(openReq.error);
    });
  });

  it('copies file to file', async function() {
    await klsh.fs.writeFile('input.txt', 'HelloWorld');
    const result = await klsh.dd.main({ args: ['if=input.txt', 'of=output.txt'], stdin: '', env: {} });
    expect(result.stdout).to.equal('');
    expect(result.stderr).to.equal('');
    expect(result.env['?']).to.equal(0);
    const out = await klsh.fs.readFile('output.txt');
    expect(out).to.equal('HelloWorld');
  });

  it('copies stdin to stdout when no if/of', async function() {
    const data = 'abc123';
    const result = await klsh.dd.main({ args: [], stdin: data, env: {} });
    expect(result.stdout).to.equal(data);
    expect(result.stderr).to.equal('');
    expect(result.env['?']).to.equal(0);
  });

  it('reads file to stdout when only if', async function() {
    await klsh.fs.writeFile('file.in', 'DataIn');
    const result = await klsh.dd.main({ args: ['if=file.in'], stdin: '', env: {} });
    expect(result.stdout).to.equal('DataIn');
    expect(result.stderr).to.equal('');
    expect(result.env['?']).to.equal(0);
  });

  it('writes stdin to file when only of', async function() {
    const data = 'XYZ';
    const result = await klsh.dd.main({ args: ['of=file.out'], stdin: data, env: {} });
    expect(result.stdout).to.equal('');
    expect(result.stderr).to.equal('');
    expect(result.env['?']).to.equal(0);
    const out2 = await klsh.fs.readFile('file.out');
    expect(out2).to.equal(data);
  });

  it('copies with block size and count', async function() {
    const long = '0123456789';
    const result = await klsh.dd.main({ args: ['bs=2', 'count=3'], stdin: long, env: {} });
    expect(result.stdout).to.equal('012345');
    expect(result.stderr).to.equal('');
    expect(result.env['?']).to.equal(0);
  });

  it('errors on missing file', async function() {
    const result = await klsh.dd.main({ args: ['if=nonexistent'], stdin: '', env: {} });
    expect(result.stdout).to.equal('');
    expect(result.stderr).to.match(/No such file or directory/);
    expect(result.env['?']).to.equal(1);
  });

  it('errors on invalid bs', async function() {
    const result = await klsh.dd.main({ args: ['bs=zero'], stdin: '123', env: {} });
    expect(result.stdout).to.equal('');
    expect(result.stderr).to.match(/invalid block size/);
    expect(result.env['?']).to.equal(1);
  });

  it('errors on invalid count', async function() {
    const result = await klsh.dd.main({ args: ['count=-5'], stdin: '123', env: {} });
    expect(result.stdout).to.equal('');
    expect(result.stderr).to.match(/invalid count/);
    expect(result.env['?']).to.equal(1);
  });

  it('errors on unrecognized option', async function() {
    const result = await klsh.dd.main({ args: ['foo=bar'], stdin: '', env: {} });
    expect(result.stdout).to.equal('');
    expect(result.stderr).to.match(/unrecognized argument/);
    expect(result.env['?']).to.equal(1);
  });
});
