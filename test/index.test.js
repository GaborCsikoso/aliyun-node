const Parser = require('../');
const fs = require('fs');
const datadir = __dirname + '/data';

let files = {};

beforeAll(() => {
  const filenames = fs.readdirSync(datadir);
  for (filename of filenames) {
    if (/\.in$/.test(filename)) {
      let key = filename.replace('.in', '');
      files[key] = files[key] || {};
      files[key].input = fs.readFileSync(datadir + '/' + filename, {
        encoding: 'utf8'
      });
    }
    if (/\.out$/.test(filename)) {
      let key = filename.replace('.out', '');
      files[key] = files[key] || {};
      files[key].output = fs.readFileSync(datadir + '/' + filename, {
        encoding: 'utf8'
      });
    }
  }
});

test('partial input', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.partial.input);
  let expected = JSON.parse(files.partial.output);
  expect(result).toEqual(expected);
});

test('ignore ill-formed verbose traces', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_verbose.input);
  expect(result.length).toBe(0);
});

test('ignore ill-formed simple traces', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_trace.input);
  expect(result.length).toBe(0);
});

test('ignore ill-formed nvp input', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_nvp.input);
  expect(result.length).toBe(0);
});

test('oom message', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.oom.input);
  expect(result.length).toBe(0);
});

test('verbose misc', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.verbose_misc.input);
  expect(result.length).toBe(0);
});

const argDict = {
  trace: '--trace_gc',
  nvp: '--trace_gc_nvp',
  verbose: '--trace_gc --trace_gc_verbose (verbose only)',
  trace_verbose: '--trace_gc --trace_gc_verbose',
  verbose_nvp: '--trace_gc --trace_gc_verbose --trace_gc_nvp'
};

const cases = [{
  version: '8',
  types: ['trace', 'nvp', 'verbose', 'trace_verbose', 'verbose_nvp']
}, {
  version: '6',
  types: ['trace', 'nvp', 'verbose', 'trace_verbose', 'verbose_nvp']
}, {
  version: '4',
  types: ['trace', 'nvp', 'verbose']
}, {
  version: '012',
  types: ['trace', 'nvp', 'verbose']
}];

cases.forEach((cs) => {
  cs.types.forEach((type) => {
    test(`v${cs.version} ${argDict[type]}`, () => {
      const key = `v${cs.version}_${type}`;
      let parser = new Parser();
      let result = parser.parseAllToData(files[key].input);
      let expected = JSON.parse(files[key].output);
      expect(result).toEqual(expected);
    });
  });
});
