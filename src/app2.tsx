import React from 'react';

import { isErr, Document } from 'earthstar';
import {
    Earthbar,
    EarthstarPeer,
    LocalStorageSettingsWriter,
    useLocalStorageEarthstarSettings,
} from 'react-earthstar';

import {
    TimerApp
} from './buntimer';

import 'react-earthstar/styles/layout.css';
import 'react-earthstar/styles/junior.css';

function App() {
    const initValues = useLocalStorageEarthstarSettings('buntimer');
    return (
        <div className="root">
            <EarthstarPeer {...initValues}>
                <div id="earthbar-root">
                    <Earthbar />
                </div>
                <LocalStorageSettingsWriter storageKey="buntimer" />
                <div id="app-root">
                    <TimerApp />
                </div>
            </EarthstarPeer>
        </div>
    );
}

export default App;
