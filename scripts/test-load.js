// Simulate browser environment and test module loading
const fs = require('fs');
const vm = require('vm');

console.log('=== Module Load Test ===\n');

// Create a simple browser-like context
const context = {
  window: {},
  console: console,
  setTimeout: setTimeout,
  String: String,
  Object: Object,
  Array: Array,
  Set: Set,
  Map: Map,
  Date: Date,
  Math: Math,
  JSON: JSON,
  isNaN: isNaN,
  parseInt: parseInt,
  parseFloat: parseFloat,
  RegExp: RegExp
};
context.window.CONFIG = { GAS_URL: null, BASE_PATH: '' };
context.global = context.window;

// Simulate AudioContext (required by sound.js)
context.AudioContext = function() {};
context.window.AudioContext = context.AudioContext;

vm.createContext(context);

// Load modules in order
const modules = [
  'src/constants.js',
  'src/utils.js',
  'src/sound.js',
  'src/services.js'
];

let allSuccess = true;

modules.forEach(file => {
  try {
    console.log(`Loading ${file}...`);
    const code = fs.readFileSync(file, 'utf8');
    vm.runInContext(code, context);
    console.log(`✅ ${file} loaded successfully`);
  } catch (err) {
    console.error(`❌ ${file} failed: ${err.message}`);
    console.error(err.stack);
    allSuccess = false;
  }
});

console.log('\n=== Checking Exports ===\n');

// Check expected exports
const expectedExports = [
  'KEYS', 'THEMES', 'SOUND_PACKS', 'DIFFICULTY', 'EMOJI_CATEGORIES',
  'getThemeAssetSet', 'VISUAL_BASES', 'THEME_COMBINATIONS',
  'isValidSudoku', 'generateLocalBoard', 'formatTime',
  'SoundManager', 'runGasFn', 'StorageService', 'initUser'
];

expectedExports.forEach(name => {
  if (context.window[name]) {
    console.log(`✅ ${name} exported`);
  } else {
    console.log(`❌ ${name} NOT exported`);
    allSuccess = false;
  }
});

console.log('\n=== Summary ===');
if (allSuccess) {
  console.log('✅ All modules loaded successfully!');
  process.exit(0);
} else {
  console.log('❌ Some modules failed to load');
  process.exit(1);
}
