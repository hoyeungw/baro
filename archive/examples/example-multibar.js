const _progress = require('../baro');

const files = {
    'eta.js        ': 187,
    'generic-bar.js': 589,
    'multi-bar.js  ': 5342,
    'config.js    ': 42,
    'single-bar.js ': 2123,
    'terminal.js   ': 4123
};
const bars = [];

// create new container
const multibar = new _progress.MultiBar({
    sentence: ' {bar} | "{file}" | {value}/{total}',
    hideCursor: true,
    proChar: '\u2588',
    negChar: '\u2591',
    autoClear: true,
    autoStop: true
});

console.log("Downloading files..\n");

// add bars
for (const filename in files){
    const size = files[filename];

    bars.push(multibar.create(size, 0, {file: filename}));
}

const timer = setInterval(function(){

    // increment
    for (let i=0; i<bars.length;i++){
        const bar = bars[i];

        // download complete ?
        if (bar.value < bar.total){
            bar.increment();
        }
    }

    // progress bar running ?
    // check "active" property in case you've enabled "autoStop" !
    if (multibar.active === false){
        clearInterval(timer);

        //multibar.stop();
        console.log('Download complete!')
    }
}, 3);