[![Build State](https://travis-ci.org/npkgz/baro.svg?branch=master)](https://travis-ci.org/npkgz/baro)

[Single Baro](#single-bar-mode) | [Multi Baro](#multi-bar-mode) | [Options](#config-1) | [Examples](archive/examples/) | [Layouts](presets/) | [Events](archive/docs/events.md)

baro
============
easy to use progress-bar for command-line/terminal applications

![Demo](assets/baro.gif)

![Demo](assets/presets.png)

Install
--------

```bash
$ yarn add baro
$ npm install baro --save
```

Features
--------

* **Simple**, **Robust** and **Easy** to use
* Full customizable output format (constious placeholders are available)
* Single progressbar mode
* Multi progessbar mode
* Custom Baro Characters
* FPS limiter
* ETA calculation based on elapsed time
* Custom Tokens to display additional data (payload) within the bar
* TTY and NOTTY mode
* No callbacks required - designed as pure, external controlled UI widget
* Works in Asynchronous and Synchronous tasks
* Layout/Theme support
* Custom bar formatters (via callback)

Usage
------------

Multiple examples are available e.g. [example.js](https://github.com/npkgz/baro/blob/master/examples/example.js) - just try it `$ node example.js`

```js
const cliProgress = require('baro');

// create a new progress bar instance and use shades_classic theme
const bar1 = new cliProgress.SingleBar({}, cliProgress.Layouts.shades_classic);

// start the progress bar with a total value of 200 and start value of 0
bar1.init(200, 0);

// update the current value in your application..
bar1.update(100);

// stop the progress bar
bar1.stop();
```

Single Baro Mode
-----------------------------------

![Demo](assets/presets.png)

### Example ###

```js
const cliProgress = require('baro');

// create new progress bar
const b1 = new cliProgress.SingleBar({
    format: 'CLI Progress |' + _colors.cyan('{bar}') + '| {progress}% || {value}/{total} Chunks || Speed: {speed}',
    proChar: '\u2588',
    negChar: '\u2591',
    hideCursor: true
});

// initialize the bar - defining payload token "speed" with the default value "N/A"
b1.init(200, 0, {
    speed: "N/A"
});

// update values
b1.increment();
b1.update(20);

// stop the bar
b1.stop();
```

### Constructor ###

Initialize a new Progress bar. An instance can be used **multiple** times! it's not required to re-create it!

```js
const cliProgress = require('baro');

const <instance> = new cliProgress.SingleBar(config:object [, preset:object]);
```

#### Options ####


### ::initialize() ###

Starts the progress bar and set the total and initial value

```js
<instance>.initialize(totalValue:int, startValue:int [, payload:object = {}]);
```

### ::update() ###

Sets the current progress value and optionally the payload with values of custom tokens as a second parameter. To update payload only, set currentValue to `null`.

```js
<instance>.update([currentValue:int [, payload:object = {}]]);

// update progress without altering value
<instance>.update([payload:object = {}]);
```

### ::increment() ###

Increases the current progress value by a specified amount (default +1). Update payload optionally

```js
<instance>.increment([delta:int [, payload:object = {}]]);

// delta=1 assumed
<instance>.increment(payload:object = {}]);
```

### ::setTotal() ###

Sets the total progress value while progressbar is active. Especially useful handling dynamic tasks.

```js
<instance>.setTotal(totalValue:int);
```

### ::stop() ###

Stops the progress bar and go to next line

```js
<instance>.stop();
```

### ::updateETA() ###

Force eta calculation update (long running processes) without altering the progress values.

Note: you may want to increase `etaCapacity` size - otherwise it can cause `INF` eta values in case the value didn't updated within the time series.

```js
<instance>.updateETA();
```


Multi Baro Mode
-----------------------------------

![Demo](assets/multibar.png)

### Example ###

```js
const cliProgress = require('baro');

// create new container
const multibar = new cliProgress.MultiBar({
    autoClear: false,
    hideCursor: true

}, cliProgress.Layouts.shades_grey);

// add bars
const b1 = multibar.create(200, 0);
const b2 = multibar.create(1000, 0);

// control bars
b1.increment();
b2.update(20, {filename: "helloworld.txt"});

// stop all bars
multibar.stop();
```

### Constructor ###

Initialize a new multiprogress container. Bars need to be added. The config/presets are used for each single bar!

```js
const cliProgress = require('baro');

const <instance> = new cliProgress.MultiBar(config:object [, preset:object]);
```

### ::create() ###

Adds a new progress bar to the container and starts the bar. Returns regular `SingleBar` object which can be individually controlled.

```js
const <barInstance> = <instance>.create(totalValue:int, startValue:int [, payload:object = {}]);
```

### ::remove() ###

Removes an existing bar from the multi progress container.

```js
<instance>.remove(<barInstance>:object);
```

### ::stop() ###

Stops the all progress bars

```js
<instance>.stop();
```

Options
-----------------------------------

The following config can be updated

- `format` (type:string|function) - progress bar output format @see format section
- `fps` (type:float) - the maximum update rate (default: 10)
- `stream` (type:stream) - output stream to use (default: `process.stderr`)
- `autoStop` (type:boolean) - automatically call `stop()` when the value reaches the total (default: false)
- `autoClear` (type:boolean) - clear the progress bar on complete / `stop()` call (default: false)
- `barSize` (type:int) - the length of the progress bar in chars (default: 40)
- `align` (type:char) - position of the progress bar - 'left' (default), 'right' or 'center'
- `proChar` (type:char) - character to use as "complete" indicator in the bar (default: "=")
- `negChar` (type:char) - character to use as "incomplete" indicator in the bar (default: "-")
- `hideCursor` (type:boolean) - hide the cursor during progress operation; restored on complete (default: false) - pass `null` to keep terminal settings
- `linewrap` (type:boolean) - disable line wrapping (default: false) - pass `null` to keep terminal settings; pass `true` to add linebreaks automatically (not recommended)
- `etaCapacity` (type:int) - number of updates with which to calculate the eta; higher numbers give a more stable eta (default: 10)
- `etaAutoUpdate` (type:boolean) - trigger an eta calculation update during asynchronous rendering trigger using the current value - should only be used for long running processes in conjunction with lof `fps` values and large `etaCapacity` (default: false)
- `syncUpdate` (type:boolean) - trigger redraw during `update()` in case threshold time x2 is exceeded (default: true) - limited to single bar usage
- `noTTYOutput` (type:boolean) - enable scheduled output to noTTY streams - e.g. redirect to files (default: false)
- `notTTYSchedule` (type:int) - set the output schedule/interval for noTTY output in `ms` (default: 2000ms)
- `autoZero` (type:boolean) - display progress bars with 'total' of zero(0) as empty, not full (default: false)
- `forceRedraw` (type:boolean) - trigger redraw on every frame even if progress remains the same; can be useful if progress bar gets overwritten by other concurrent writes to the terminal (default: false)
- `barGlue` (type:string) - a "glue" string between the complete and incomplete bar elements used to insert ascii control sequences for colorization (default: empty) - Note: in case you add visible "glue" characters the barSize will be increased by the length of the glue!
- `autoPadding` (type: boolean) - add padding chars to formatted time and progress to force fixed width (default: false) - Note: handled standard format functions!
- `padChar` (type: string) - the character sequence used for autoPadding (default: "   ") - Note: due to performance optimizations this value requires a length of 3 identical chars
- `barChars` (type: function) - a custom bar formatter function which renders the bar-element (default: [format-bar.js](lib/format-bar.js))
- `formatTime` (type: function) - a custom timer formatter function which renders the formatted time elements like `eta_formatted` and `duration-formatted` (default: [format-time.js](lib/format-time.js))
- `formatValue` (type: function) - a custom value formatter function which renders all other values (default: [format-value.js](lib/format-value.js))

Events
-----------------------------------

The classes extends [EventEmitter](https://nodejs.org/api/events.html) which allows you to hook into different events.

See [event docs](archive/docs/events.md) for detailed information + examples.

Baro Formatting
-----------------------------------

The progressbar can be customized by using the following build-in placeholders. They can be combined in any order.

- `{bar}` - the progress bar, customizable by the config **barSize**, **proChars** and **negChars**
- `{progress}` - the current progress in percent (0-100)
- `{total}` - the end value
- `{value}` - the current value set by last `update()` call
- `{eta}` - expected time of accomplishment in seconds (limited to 115days, otherwise INF is displayed)
- `{duration}` - elapsed time in seconds
- `{eta_formatted}` - expected time of accomplishment formatted into appropriate units
- `{duration_formatted}` - elapsed time formatted into appropriate units

### Example ###

```js
const opt = {
    format: 'progress [{bar}] {progress}% | ETA: {eta}s | {value}/{total}'
}
```

is rendered as

```
progress [========================================] 100% | ETA: 0s | 200/200
```

Custom formatters
-----------------------------------

Instead of a "static" format string it is also possible to pass a custom callback function as formatter.
For a full example (including params) take a look on `lib/formatter.js`

### Example 1 ###

```js
function formatter(config, params, payload){

    // bar grows dynamically by current progress - no whitespaces are added
    const bar = config.barCompleteString.substr(0, Math.round(params.progress*config.barSize));

    // end value reached ?
    // change color to green when finished
    if (params.value >= params.total){
        return '# ' + _colors.grey(payload.task) + '   ' + _colors.green(params.value + '/' + params.total) + ' --[' + bar + ']-- ';
    }else{
        return '# ' + payload.task + '   ' + _colors.yellow(params.value + '/' + params.total) + ' --[' + bar + ']-- ';
    }
}

const opt = {
    format: formatter
}
```

is rendered as

```
# Task 1     0/200 --[]--
# Task 1     98/200 --[████████████████████]--
# Task 1     200/200 --[████████████████████████████████████████]--
```


### Example 2 ###

You can also access the default format functions to use them within your formatter:

```js
const {TimeFormat, ValueFormat, BarFormat, Formatter} = require('cli-progess').Format;
...
```

Examples
---------------------------------------------

### Example 1 - Set Options ###

```js
// change the progress characters
// set fps limit to 5
// change the output stream and barSize
const bar = new _progress.Baro({
    proChar: '#',
    negChar: '.',
    fps: 5,
    stream: process.stdout,
    barSize: 65,
    position: 'center'
});
```

### Example 2 - Change Styles defined by Layout ###

```js
// uee shades preset
// change the barSize
const bar = new _progress.Baro({
    barSize: 65,
    position: 'right'
}, _progress.Layouts.shades_grey);
```

### Example 3 - Custom Payload ###

The payload object keys should only contain keys matching standard `\w+` regex!

```js
// create new progress bar with custom token "speed"
const bar = new _progress.Baro({
    format: 'progress [{bar}] {progress}% | ETA: {eta}s | {value}/{total} | Speed: {speed} kbit'
});

// initialize the bar - set payload token "speed" with the default value "N/A"
bar.init(200, 0, {
    speed: "N/A"
});

// some code/update loop
// ...

// update bar value. set custom token "speed" to 125
bar.update(5, {
    speed: '125'
});

// process finished
bar.stop();
```

### Example 4 - Custom Layouts ###

**File** `myPreset.js`

```js
const _colors = require('colors');

module.exports = {
    format: _colors.red(' {bar}') + ' {progress}% | ETA: {eta}s | {value}/{total} | Speed: {speed} kbit',
    proChar: '\u2588',
    negChar: '\u2591'
};
```

**Application**

```js
const myPreset = require('./myPreset.js');

const bar = new _progress.Baro({
    barSize: 65
}, myPreset);
```


Layouts/Themes
---------------------------------------------

Need a more modern appearance ? **baro** supports predefined themes via presets. You are welcome to add your custom one :)

But keep in mind that a lot of the "special-chars" rely on Unicode - it might not work as expected on legacy systems.

### Default Layouts ###

The following presets are included by default

* **legacy** - Styles as of baro v1.3.0
* **shades-classic** - Unicode background shades are used for the bar
* **shades-grey** - Unicode background shades with grey bar
* **rect** - Unicode Rectangles


Compatibility
---------------------------------------------

**baro** is designed for linux/macOS/container applications which mostly providing standard compliant tty terminals/shells. In non-tty mode it is suitable to be used with logging daemons (cyclic output).

It also works with PowerShell on Windows 10 - the legacy command prompt on outdated Windows versions won't work as expected and is not supported!

Any Questions ? Report a Bug ? Enhancements ?
---------------------------------------------
Please open a new issue on [GitHub](https://github.com/npkgz/baro/issues)

License
-------
baro is OpenSource and licensed under the Terms of [The MIT License (X11)](http://opensource.org/licenses/MIT). You're welcome to [contribute](https://github.com/npkgz/baro/blob/master/CONTRIBUTE.md)!
