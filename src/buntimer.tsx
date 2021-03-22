import React from 'react';

import {
    AuthorKeypair,
    IStorageAsync,
    Query,
    WriteResult,
    isErr,
} from 'earthstar';
import {
    useDocuments,
    useCurrentWorkspace,
    useCurrentAuthor,
    useStorage,
} from 'react-earthstar';

import {
    Stack,
    Box,
    VBox,
    Cluster,
    ClusterStretch,
} from './lib/layouts';

import { config } from './config';

//================================================================================
// CONSTANTS AND HELPERS

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

let remap = (x: number, oldLo: number, oldHi: number, newLo: number, newHi: number): number => {
    let pct = (x - oldLo) / (oldHi - oldLo);
    return newLo + pct * (newHi - newLo);
}
let clamp = (x: number, lo: number, hi: number) => {
    // this works even if lo and hi are in the wrong order
    let lo2 = Math.min(lo, hi);
    let hi2 = Math.max(lo, hi);
    return Math.max(lo2, Math.min(hi2, x));
}

let remapAndClamp = (x: number, oldLo: number, oldHi: number, newLo: number, newHi: number): number =>
    clamp(remap(x, oldLo, oldHi, newLo, newHi), newLo, newHi);

//================================================================================
// TYPES

interface Timer {
    id: string;
    endTime: number; // times in ms
    name: string;
    isDone: boolean;
}

//================================================================================

class TimerApi {
    static makeNew(id?: string): Timer {
        return {
            id: id || '' + Math.floor(Math.random() * 999999999999),
            endTime: Date.now() + 90 * MIN,
            name: 'new timer',
            isDone: false,
        };
    }
    static async save(keypair: AuthorKeypair, storage: IStorageAsync, timer: Timer): Promise<void> {
        let result = await storage.set(keypair, {
            format: 'es.4',
            path: `/buntimer-v1/timers/common/${timer.id}!.json`,
            content: JSON.stringify(timer),
            deleteAfter: (Date.now() + 7 * DAY) * 1000,
        });
        if (isErr(result) || result === WriteResult.Ignored) {
            console.error(result);
        }
    }
    static async delete(keypair: AuthorKeypair, storage: IStorageAsync, id: string): Promise<void> {
        let result = await storage.set(keypair, {
            format: 'es.4',
            path: `/buntimer-v1/timers/common/${id}!.json`,
            content: '',
            deleteAfter: (Date.now() + 7 * DAY) * 1000,
        });
        if (isErr(result) || result === WriteResult.Ignored) {
            console.error(result);
        }
    }
}

//================================================================================

let useForceRender = () => {
    let [n, setN] = React.useState(0);
    return () => setN(n + 1);
};

let useRerenderEvery = (ms: number) => {
    // re-render a component every X milliseconds
    let forceRender = useForceRender();
    React.useEffect(() => {
        let timeout = setTimeout(() => {
            forceRender();
        }, ms);
        return () => clearTimeout(timeout);
    });
};

export let TimerApp: React.FunctionComponent<any> = (props: any) => {
    let query: Query = {
        pathStartsWith: '/buntimer-v1/timers/common/',
        pathEndsWith: '.json',
        // we can't use this query option because it doesn't work on path
        // queries, which are used internally by useDocuments() to know
        // when to refresh...
        //contentLengthGt: 0,
    };

    // get earthstar stuff from hooks
    let [currentWorkspace] = useCurrentWorkspace();
    let [keypair] = useCurrentAuthor();
    let storage = useStorage();
    let docs = useDocuments(query);

    let [showDone, setShowDone] = React.useState(false);

    useRerenderEvery(10 * SEC);

    if (currentWorkspace === null || keypair === null) {
        return <p>
            To use this app,
            <ol>
                <li>Join or create a workspace</li>
                <li>Create a user, or sign in as a user, from the upper right.</li>
            </ol>
            Then you can add timers.
        </p>;
    }

    let timers: Timer[] = [];
    if (!config.FAKE_DATA) {
        // real data

        // parse document content from JSON to Timer objects
        for (let doc of docs) {
            try {
                let timer: Timer = JSON.parse(doc.content);
                if (showDone || !timer.isDone) {
                    timers.push(timer);
                }
            } catch (err) {
                // skip empty docs and non-json content
            }
        }
        // sort oldest first
        timers.sort((a: Timer, b: Timer) => a.endTime - b.endTime);

    } else {
        // demo timers for testing
        timers = [
            {
                id: 'a0',
                endTime: Date.now() - 1234 * MIN,
                name: 'laundry -1234 min',
                isDone: true,
            },
            {
                id: 'a1',
                endTime: Date.now() - 12 * MIN,
                name: 'laundry -12 min',
                isDone: true,
            },
            {
                id: 'a2',
                endTime: Date.now() - 10 * MIN,
                name: 'laundry -10 min',
                isDone: false,
            },
            {
                id: 'a3',
                endTime: Date.now() - 20 * SEC,
                name: 'laundry -20 sec',
                isDone: false,
            },
            {
                id: 'b1',
                endTime: Date.now() + 20 * SEC,
                name: 'eat 20 sec',
                isDone: false,
            },
            {
                id: 'b2',
                endTime: Date.now() + 3 * MIN,
                name: 'eat 3 min',
                isDone: false,
            },
            {
                id: 'b3',
                endTime: Date.now() + 14.9 * MIN,
                name: 'eat 14.9 min',
                isDone: false,
            },
            {
                id: 'c0',
                endTime: Date.now() + 15.1 * MIN,
                name: 'go for a walk 15.1 min',
                isDone: false,
            },
            {
                id: 'c1',
                endTime: Date.now() + 45 * MIN,
                name: 'go for a walk 45',
                isDone: false,
            },
            {
                id: 'c2',
                endTime: Date.now() + 60 * MIN,
                name: 'go for a walk 60',
                isDone: false,
            },
            {
                id: 'c3',
                endTime: Date.now() + 90 * MIN,
                name: 'go for a walk 90',
                isDone: false,
            },
            {
                id: 'c4',
                endTime: Date.now() + 333 * MIN,
                name: 'go for a walk 333',
                isDone: false,
            },
        ];
        // end of fake data
    }

    // prepare callbacks for the individual rows to use
    let addTimer = async () => {
        if (keypair !== null && storage !== null) {
            let newTimer = TimerApi.makeNew();
            await TimerApi.save(keypair, storage, newTimer);
        }
    }
    let saveTimer = async (timer: Timer) => {
        if (keypair !== null && storage !== null) {
            await TimerApi.save(keypair, storage, timer);
        }
    }
    let deleteTimer = async (id: string) => {
        if (keypair !== null && storage !== null) {
            // TODO: this isn't making this component re-render.
            // useDocuments(query) isn't noticing that it needs to re-run
            // after a deletion happens.
            // forceRender doesn't help.
            await TimerApi.delete(keypair, storage, id);
            //forceRender();
        }
    }

    return (
        <VBox size="3" style={{ userSelect: 'none' }}>
            <Stack size="1">
                {timers.map((timer) => (
                    <TimerView
                        key={timer.id}
                        timer={timer}
                        saveTimer={saveTimer}
                        deleteTimer={deleteTimer}
                    />
                ))}
                <Box size="2">
                    <Cluster align="right" size="2">
                        <button type="button"
                            className="buttonSolidFaint"
                            onClick={addTimer}
                        >
                            Add timer
                        </button>
                        <button type="button"
                            className="buttonHollowFaint"
                            onClick={() => setShowDone(!showDone)}
                        >
                            {showDone ? 'Hide done' : 'Show done'}
                        </button>
                    </Cluster>
                </Box>
            </Stack>
        </VBox>
    );
};

interface TimerViewProps {
    timer: Timer;
    saveTimer: (timer: Timer) => Promise<void>;
    deleteTimer: (id: string) => Promise<void>;
}
let TimerView: React.FunctionComponent<TimerViewProps> = (props: TimerViewProps) => {
    let { timer, saveTimer, deleteTimer } = props;

    // make human readable time strings
    let now = Date.now();
    let relMinutes = (timer.endTime - now) / MIN;
    let relMinutesStr = '' + Math.round(relMinutes) + 'm';
    let dt = new Date(timer.endTime);
    let hour = dt.getHours();
    let am = hour < 12;
    if (hour > 12) { hour -= 12; }
    if (hour === 0) { hour = 12; }
    let hourStr = '' + hour;
    let minuteStr = ('' + dt.getMinutes()).padStart(2, '0');
    let amStr = am ? 'am' : 'pm';
    let absTime = `${hourStr}:${minuteStr}${amStr}`;

    // default: green
    let colorL: string = 'var(--cPage)';
    let colorR: string = 'var(--cRelax)';
    let textOpacity: number = 0.45;
    if (relMinutes <= 15) {
        // yellow
        colorR= 'var(--cSoon)';
        textOpacity = 1.0;
    }
    if (relMinutes < 0) {
        // red
        colorR = 'var(--cLate)';
        textOpacity = 1.0;
    }
    if (timer.isDone) {
        // gray
        colorR = 'var(--cDone)';
        textOpacity = 0.3;
    }

    if (config.BARS_LEFT_TO_RIGHT) {
        [colorL, colorR] = [colorR, colorL];
    }
    let grad_degrees = 90 + 15 * (config.BARS_LEFT_TO_RIGHT ? 1 : -1);
    let progress = remapAndClamp(relMinutes, 0, 60, 0, 97);
    if (config.BARS_LEFT_TO_RIGHT) { progress = 100 - progress; }
    // simple changing gradient
    //let background = `linear-gradient(${grad_degrees}deg, ${colorL} 0% ${progress}%, ${colorR} ${progress}% 100%)`

    // gradient that animates by sliding with backgroundPosition.
    // The colorful part is actually the backgroundColor,
    // and the empty part is the gradient which is partially transparent.
    let background = `linear-gradient(${grad_degrees}deg,
        ${colorL} 0% 49%,
        transparent 51% 100%)`;
    let bgStyle: React.CSSProperties = {
        backgroundColor: colorR,
        backgroundImage: background,
        backgroundSize: '206% 100%',
        backgroundPosition: `${100-progress}% 50%`,  // 0 shows the left side, 100 shows the right side
        transitionProperty: 'background-position, background-color',
        transitionDuration: '0.4s',
        transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',  // hard start, gentle ease out
    };


    let onClickDone = () => {
        saveTimer({
            ...timer,
            isDone: !timer.isDone,
            // if it's a very old task, don't change the endTime.
            // otherwise change the endTime to now() since we just completed it.
            endTime: relMinutes < -200 ? timer.endTime : Date.now(),
        });
    };

    let onClickRelTime = () => {
        // ask user for new relative time
        let newTime = prompt('Minutes from now');
        if (newTime === null) { return; }
        if (newTime.endsWith('m')) {
            newTime = newTime.slice(0, newTime.length-1);
        }
        let min = +newTime;
        if (isNaN(min)) { return; }
        let newTimer: Timer = {
            ...timer,
            endTime: Date.now() + min * MIN,
        }
        saveTimer(newTimer);
    };

    let onClickName = () => {
        // ask user for new name
        let newName = prompt('Description');
        if (newName === null || newName.trim() === '') { return; }
        newName = newName.trim();
        saveTimer({
            ...timer,
            name: newName,
        });
    };

    let relTimeOpacity = textOpacity * 0.85;
    let absTimeOpacity = textOpacity * 0.85;
    let nameOpacity = textOpacity;
    let buttonOpacity = 0.8;

    return (
        <Box style={bgStyle} size="2">
            <VBox size={(relMinutes < 0 && !timer.isDone) ? "3" : "0"}>
                <Cluster wrap={false} valign="baseline">
                    <button
                        className="notButton"
                        style={{
                            width: '6ch',
                            textAlign: 'right',
                            opacity: relTimeOpacity,
                            fontWeight: 'bold',
                            fontSize: '140%',
                        }}
                        onClick={onClickRelTime}
                    >
                        {relMinutesStr}
                    </button>
                    <button
                        style={{ width: '7ch', textAlign: 'right', opacity: absTimeOpacity }}
                        className="notButton"
                        >
                        <i>{absTime}</i>
                    </button>
                    <button
                        style={{ marginLeft: '1.3ch', minWidth: '5ch', opacity: nameOpacity }}
                        onClick={onClickName}
                        className="notButton"
                    >
                        {timer.name}
                    </button>
                    <ClusterStretch />
                    <button
                        type="button"
                        className="buttonHollowFaint"
                        onClick={onClickDone}
                        style={{ opacity: buttonOpacity }}
                    >
                        done
                    </button>
                    <button
                        type="button"
                        className="buttonHollowFaint"
                        onClick={() => deleteTimer(timer.id)}
                        style={{ opacity: buttonOpacity }}
                    >
                        <b>X</b>
                    </button>
                </Cluster>
            </VBox>
        </Box>
    );
};

