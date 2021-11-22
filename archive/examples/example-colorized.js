const _progress = require('../baro');

// create a new progress bar with preset
const bar = new _progress.Bar({
    // green bar, reset styles after bar element
    sentence: ' >> [\u001b[32m{bar}\u001b[0m] {progress}% | ETA: {eta}s | {value}/{total}',

    // same chars for bar elements, just separated by colors
    proChar: '#',
    negChar: '#',

    // change color to yellow between bar complete/incomplete -> incomplete becomes yellow
    barGlue: '\u001b[33m'
});
bar.init(200, 0);

// random value 1..200
bar.update(~~((Math.random() * 200) + 1));
bar.stop();
