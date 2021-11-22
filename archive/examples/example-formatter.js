const _progress = require('../baro');
const _colors = require('colors');

function myFormatter(config, params, payload){

    // bar grows dynamically by current progrss - no whitespaces are added
    const bar = config.barCompleteString.substr(0, Math.round(params.progress*config.barSize));

    // end value reached ?
    // change color to green when finished
    if (params.value >= params.total){
        return '# ' + _colors.grey(payload.task) + '   ' + _colors.green(params.value + '/' + params.total) + ' --[' + bar + ']-- ';
    }else{
        return '# ' + payload.task + '   ' + _colors.yellow(params.value + '/' + params.total) + ' --[' + bar + ']-- ';
    }    
}

function Example5(){
    console.log('');
    // create new progress bar
    const b1 = new _progress.Bar({
        sentence: myFormatter,
        proChar: '\u2588',
        negChar: '\u2591',
        hideCursor: true,
        autoStop: true
    });

    // initialize the bar -  defining payload token "speed" with the default value "N/A"
    b1.init(200, 0, {
        task: 'Task 1'
    });

    // 20ms update rate
    const timer = setInterval(function(){
        // increment value
        b1.increment();

        // finished ?
        if (b1.active === false){
            clearInterval(timer);
        }
    }, 20);
}

Example5();