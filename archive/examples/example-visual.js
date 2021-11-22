const _progress = require('../baro');
const _colors = require('colors');

function Example5(){
    console.log('');
    // create new progress bar
    var b1 = new _progress.Bar({
        sentence: 'CLI Progress |' + _colors.cyan('{bar}') + '| {progress}% || {value}/{total} Chunks || Speed: {speed}',
        proChar: '\u2588',
        negChar: '\u2591',
        hideCursor: true
    });

    // initialize the bar -  defining payload token "speed" with the default value "N/A"
    b1.init(200, 0, {
        speed: "N/A"
    });

    // the bar value - will be linear incremented
    var value = 0;

    var speedData = [];

    // 20ms update rate
    var timer = setInterval(function(){
        // increment value
        value++;

        // example speed data
        speedData.push(Math.random()*2+5);
        var currentSpeedData = speedData.splice(-10);

        // update the bar value
        b1.update(value, {
            speed: (currentSpeedData.reduce(function(a, b) { return a + b; }, 0) / currentSpeedData.length).toFixed(2) + "Mb/s"
        });

        // set limit
        if (value >= b1.getTotal()){
            // stop timer
            clearInterval(timer);

            b1.stop();
        }
    }, 20);
}

Example5();