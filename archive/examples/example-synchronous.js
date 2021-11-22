const _progress = require('../baro');

// long running, recursive function (blocking operation)
// well it's no optimized and not for productive use but it's an easy way to implement a long-running & blocking operation without third-party modules
function fibonacci(n) {
    if (n < 2) {
        return 1;
    }else {
        return fibonacci(n - 2) + fibonacci(n - 1);
    }
}

function runSinglebar(config, limit){
    // create new progress bar using default values
    const bar = new _progress.Bar(config);
    bar.init(limit, 1);

    const fibonacciNumbers = [];

    // calculate the Nth fibonacci
    // this loop is executed synchronous - no timer/interval callbacks will be executed
    for (let i = 1; i <= limit; i++) {
        fibonacciNumbers.push(fibonacci(i));
        bar.update(i);
    }

    bar.stop();

    // display the numbers:
    console.log('\nFibonacci (1-', fibonacciNumbers.length,'): ', fibonacciNumbers.join(', '), '\n');
}

function runMultibar(config, limit){
    // create new progress bar using default values
    const multibar = new _progress.MultiBar(config);
    
    const bar1 = multibar.create(limit, 1);
    const bar2 = multibar.create(2124, 541);

    const fibonacciNumbers = [];

    // calculate the Nth fibonacci
    // this loop is executed synchronous - no timer/interval callbacks will be executed
    for (let i = 1; i <= limit; i++) {
        fibonacciNumbers.push(fibonacci(i));
        bar1.update(i);
        bar2.increment(89);

        // force redraw 
        multibar.update();
    }

    // stop all bars
    multibar.stop();

    // display the numbers:
    console.log('\nFibonacci (1-', fibonacciNumbers.length,'): ', fibonacciNumbers.join(', '), '\n');
}

console.log('\nCalculation without synchronous updates');
runSinglebar({
    sentence: 'Fibonacci Calculation Progress [{bar}] {progress}% | ETA: {eta}s | Current: F({value})',
    hideCursor: true,
    syncUpdate: false
}, 40);

console.log('\nCalculation WITH synchronous updates');
runSinglebar({
    sentence: 'Fibonacci Calculation Progress [{bar}] {progress}% | ETA: {eta}s | Current: F({value})',
    hideCursor: true,
    syncUpdate: true
}, 43);


console.log('\nMultibar calculation synchronous enforced updates (synchronous mode not available)');
runMultibar({
    sentence: 'Fibonacci Calculation Progress [{bar}] {progress}% | ETA: {eta}s | Current: F({value})',
    hideCursor: true
}, 43);

