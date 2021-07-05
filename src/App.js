import './App.scss';
import React from "react";

function SessionDisplay(props) {
    return (
        <section id="session-display">
            <p id="timer-label">{props.mode}</p>
            <div id="time-left">
                {props.minutes}:{props.seconds}
            </div>
        </section>
    )
}


function LengthType(props) {
    const title = props.id[0].toUpperCase() + props.id.slice(1) + ' Length'
    return (
        <div className="length">
            <p id={`${props.id}-label`}>{title}</p>
            <div>
                <button id={`${props.id}-decrement`} disabled={props.disable} onClick={() => props.changeValue('-')}>-
                </button>
                <span id={`${props.id}-length`}>{props.value}</span>
                <button id={`${props.id}-increment`} disabled={props.disable} onClick={() => props.changeValue('+')}>+
                </button>
            </div>
        </div>
    )
}

const MODE = Object.freeze({
    SESSION: 'Session',
    BREAK: 'Break'
});

const initState = {
    breakValue: 1,
    sessionValue: 1,
    countdownMinutes: 1,
    countdownSeconds: 0,
    running: null,
    mode: MODE.SESSION
}

class App extends React.Component {
    audioBeep = null;
    constructor(props) {
        super(props);
        this.state = JSON.parse(JSON.stringify(initState));
        this.reset = this.reset.bind(this);

        this.changeBreak = this.changeBreak.bind(this);
        this.changeSession = this.changeSession.bind(this);

        this.startStop = this.startStop.bind(this);
        this.countdownHandler = this.countdownHandler.bind(this);
    }

    reset() {
        this.audioBeep.pause();
        this.audioBeep.currentTime = 0;
        clearInterval(this.state.running);
        this.setState(JSON.parse(JSON.stringify(initState)));
    }

    changeSession(direction) {
        const sessionValue = this.switchValue(this.state.sessionValue, direction);
        this.setState({
            sessionValue, countdownMinutes: sessionValue, countdownSeconds: 0
        });
    }

    changeBreak(direction) {
        this.setState({
            breakValue: this.switchValue(this.state.breakValue, direction)
        });
    }

    switchValue(value, direction) {
        switch (direction) {
            case '+':
                return Math.min(60, value + 1);
            case '-':
                return Math.max(value - 1, 1);
            default:
                return value;
        }
    }

    startStop() {
        if (this.state.running === null) {
            this.setState({running: setInterval(this.countdownHandler, 1000)});
        } else {
            this.audioBeep.pause();
            this.audioBeep.currentTime = 0;
            clearInterval(this.state.running);
            this.setState({running: null});
        }

    }

    countdownHandler() {
        let seconds = this.state.countdownSeconds;
        let minutes = this.state.countdownMinutes;

        if (seconds === 0) {
            seconds = 59;
            minutes -= 1;
        } else {
            seconds -= 1;
        }

        if (minutes < 0) {
            this.setState({
                mode: this.state.mode === MODE.SESSION ? MODE.BREAK : MODE.SESSION,
                countdownMinutes: this.state.mode === MODE.SESSION ? this.state.sessionValue : this.state.breakValue,
                countdownSeconds: 0
            });
            this.audioBeep.currentTime = 0;
            this.audioBeep.play();
        } else {
            this.setState({
                countdownMinutes: minutes,
                countdownSeconds: seconds
            });
        }
    }

    render() {
        return (
            <div className="App">
                <LengthType
                    id="break" value={this.state.breakValue} changeValue={this.changeBreak}
                    disable={this.state.running !== null}/>
                <LengthType
                    id="session" value={this.state.sessionValue} changeValue={this.changeSession}
                    disable={this.state.running !== null}/>
                <SessionDisplay
                    mode={this.state.mode}
                    minutes={this.state.countdownMinutes}
                    seconds={this.state.countdownSeconds.toString().padStart(2, '0')}/>
                <audio
                    id="beep"
                    preload="auto"
                    ref={(audio) => {
                        this.audioBeep = audio;
                    }}
                    src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
                />
                <button id="start_stop" onClick={this.startStop}>Start/Stop</button>
                <button id="reset" onClick={this.reset}>Reset</button>
            </div>
        );
    }
}

export default App;
