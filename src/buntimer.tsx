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
    Cluster,
    ClusterStretch,
} from './lib/layouts';

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

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
            id: 'b',
            endTime: Date.now() + 3 * MIN,
            name: 'eat',
        },
        {
            id: 'c',
            endTime: Date.now() + 45 * MIN,
            name: 'go for a walk',
        },
    ];

    return (
        <>
            <Stack>
            <h1>Hello</h1>
            {demoTimers.map((timer) => (
                <TimerView key={timer.id} timer={timer} />
            ))}
            </Stack>
        </>
    );
};

interface TimerViewProps {
    timer: Timer;
}
let TimerView: React.FunctionComponent<TimerViewProps> = (props: TimerViewProps) => {
    let { timer } = props;
    let now = Date.now();
    let relMinutes = Math.round((timer.endTime - now) / MIN);
    let dt = new Date(timer.endTime);
    let hour = dt.getHours();
    let am = hour >= 12;
    if (hour > 12) { hour -= 12; }
    if (hour === 0) { hour = 12; }
    let hourStr = '' + hour;
    let minuteStr = ('' + dt.getMinutes()).padStart(2, '0');
    let amStr = am ? 'am' : 'pm'
    let absTime = `${hourStr}:${minuteStr}${amStr}`;
    return (
        <Cluster>
            <button type='button' className='buttonSolidFaint'>done</button>
            <div style={{width: '6ch', textAlign: 'right'}}>
                <b>{relMinutes}m</b>
            </div>
            <div style={{width: '7ch', textAlign: 'right'}}>{absTime}</div>
            <div style={{marginLeft: '2ch'}}>
                {timer.name}
            </div>
            <ClusterStretch/>
            <button type="button" className='buttonSolidFaint'><b>X</b></button>
        </Cluster>
    );
};

