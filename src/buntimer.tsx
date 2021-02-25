import React from 'react';

import { AuthorKeypair, isErr, Document, Query, IStorageAsync, WriteResult } from 'earthstar';
import {
    Earthbar,
    EarthstarPeer,
    LocalStorageSettingsWriter,
    useDocuments,
    useCurrentWorkspace,
    useLocalStorageEarthstarSettings,
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

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

let remap = (x: number, oldLo: number, oldHi: number, newLo: number, newHi: number): number => {
    let pct = (x - oldLo) / (oldHi - oldLo);
    return newLo + pct * (newHi - newLo);
}
let clamp = (x: number, lo: number, hi: number) => {
    return Math.max(lo, Math.min(hi, x));
}
let remapAndClamp = (x: number, oldLo: number, oldHi: number, newLo: number, newHi: number): number => {
    return clamp(remap(x, oldLo, oldHi, newLo, newHi), newLo, newHi);
}

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
        id: id || ('' + Math.floor(Math.random()*999999999999)),
        endTime: Date.now() + 30 * MIN,
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
    return () => setN(n+1);
}

export let TimerApp: React.FunctionComponent<any> = (props: any) => {
    let query: Query = {
        pathStartsWith: '/buntimer-v1/timers/common/',
        pathEndsWith: '.json',
        contentLengthGt: 0,
    }

    // get earthstar stuff from hooks
    //let forceRender = useForceRender();
    let [currentWorkspace] = useCurrentWorkspace();
    let [keypair] = useCurrentAuthor();
    let storage = useStorage();
    let docs = useDocuments(query);

    // parse document content from JSON to Timer objects
    let timers: Timer[] = [];
    for (let doc of docs) {
        try {
            timers.push(JSON.parse(doc.content));
        } catch (err) {
        }
    }
    // sort oldest first
    timers.sort((a: Timer, b: Timer) => a.endTime - b.endTime);

    if (currentWorkspace === null || keypair === null) {
        return <p>
            To use this app, join/create a workspace and also sign in as a user.
        </p>;
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

    /*
    // TODO: load these from the workspace documents
    let demoTimers: Timer[] = [
        {
            id: 'a',
            endTime: Date.now() - 12 * MIN,
            name: 'laundry',
        },
        {
            id: 'a2',
            endTime: Date.now() - 20 * SEC,
            name: 'laundry',
        },
        {
            id: 'b2',
            endTime: Date.now() + 20 * SEC,
            name: 'eat',
        },
        {
            id: 'b',
            endTime: Date.now() + 3 * MIN,
            name: 'eat',
        },
        {
            id: 'c',
            endTime: Date.now() + 45 * MIN,
            name: 'go for a walk',
        },
        {
            id: 'c2',
            endTime: Date.now() + 60 * MIN,
            name: 'go for a walk',
        },
        {
            id: 'c3',
            endTime: Date.now() + 90 * MIN,
            name: 'go for a walk',
        },
    ];
    */

    return (
        <VBox size="3">
        <Stack size="1">
            {timers.map((timer) => (
                <TimerView key={timer.id} timer={timer}
                saveTimer={saveTimer}
                deleteTimer={deleteTimer}
                />
            ))}
            <VBox size="2">
                <Cluster align='center'>
                    <button type="button" className="buttonSolidFaint" onClick={addTimer}>
                        Add
                    </button>
                </Cluster>
            </VBox>
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
    let amStr = am ? 'am' : 'pm'
    let absTime = `${hourStr}:${minuteStr}${amStr}`;

    let color: string = 'var(--cRelax)';
    if (relMinutes <= 15) { color = 'var(--cSoon)'; }
    if (relMinutes < 0) { color = 'var(--cLate)'; }
    if (timer.isDone) { color = 'var(--cDone)'; }
    console.log(relMinutesStr, color);

    let background = color;
    if (relMinutes > 0 && !timer.isDone) {
        let progress = remapAndClamp(relMinutes, 0, 60, 0.5, 101);
        background = `linear-gradient(75deg, ${color} 0% ${progress}%, transparent ${progress}% 100%)`
    }

    let onClickDone = () => {
        saveTimer({
            ...timer,
            isDone: !timer.isDone,
            endTime: relMinutes < 0 ? timer.endTime : Date.now(),
        });
    }

    let onClickRelTime = () => {
        let newTime = prompt('minutes');
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
    }

    return (
        <Box style={{ background: background }}>
            <Cluster wrap={false}>
                <button
                    type="button"
                    className={timer.isDone ? "buttonHollowStrong" : "buttonHollowFaint"}
                    onClick={onClickDone}
                >
                    done
                </button>
                <div style={{ width: '6ch', textAlign: 'right' }}
                    onClick={onClickRelTime}
                    >
                    <b>{relMinutesStr}</b>
                </div>
                <div style={{ width: '7ch', textAlign: 'right' }}>{absTime}</div>
                <div style={{ marginLeft: '2ch' }}>{timer.name}</div>
                <ClusterStretch />
                <button
                    type="button"
                    className="buttonSolidFaint"
                    onClick={() => deleteTimer(timer.id)}
                >
                    <b>X</b>
                </button>
            </Cluster>
        </Box>
    );
};

