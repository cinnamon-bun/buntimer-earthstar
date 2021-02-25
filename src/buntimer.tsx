import React from 'react';

import { isErr, Document } from 'earthstar';
import {
    Earthbar,
    EarthstarPeer,
    LocalStorageSettingsWriter,
    useCurrentWorkspace,
    useLocalStorageEarthstarSettings,
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
}

export let TimerApp: React.FunctionComponent<any> = (props: any) => {
    let [currentWorkspace] = useCurrentWorkspace();
    if (currentWorkspace === null) {
        return <p>
            Join or create a workspace to start using this app.
        </p>;
    }

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

    return (
        <Stack size="2">
            <h1>Hello</h1>
            {demoTimers.map((timer) => (
                <TimerView key={timer.id} timer={timer} />
            ))}
        </Stack>
    );
};

interface TimerViewProps {
    timer: Timer;
}
let TimerView: React.FunctionComponent<TimerViewProps> = (props: TimerViewProps) => {
    let { timer } = props;
    let now = Date.now();
    let relMinutes = (timer.endTime - now) / MIN;
    let relMinutesStr = '' + Math.round(relMinutes) + 'm';
    let dt = new Date(timer.endTime);
    let hour = dt.getHours();
    let am = hour >= 12;
    if (hour > 12) { hour -= 12; }
    if (hour === 0) { hour = 12; }
    let hourStr = '' + hour;
    let minuteStr = ('' + dt.getMinutes()).padStart(2, '0');
    let amStr = am ? 'am' : 'pm'
    let absTime = `${hourStr}:${minuteStr}${amStr}`;

    let color: string = 'var(--cRelax)';
    if (relMinutes <= 15) { color = 'var(--cSoon)'; }
    if (relMinutes < 0) { color = 'var(--cLate)'; }

    let background = color;
    if (relMinutes > 0) {
        let progress = remapAndClamp(relMinutes, 0, 60, 0.5, 101);
        background = `linear-gradient(75deg, ${color} 0% ${progress}%, transparent ${progress}% 100%)`
    }

    return (
        <Box style={{background: background}}>
            <Cluster wrap={false}>
                <button type='button' className='buttonSolidFaint'>done</button>
                <div style={{width: '6ch', textAlign: 'right'}}>
                    <b>{relMinutesStr}</b>
                </div>
                <div style={{width: '7ch', textAlign: 'right'}}>{absTime}</div>
                <div style={{marginLeft: '2ch'}}>
                    {timer.name}
                </div>
                <ClusterStretch/>
                <button type="button" className='buttonSolidFaint'><b>X</b></button>
            </Cluster>
        </Box>
    );
};

