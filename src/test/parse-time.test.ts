import { parseTime } from '../lib/parse-time';

test('parseTime', () => {
    let equivs : string[][] = [
        ['0', '12:00am'],
        ['0:34', '12:34a', '12:34 a', '12:34am', '12:34 am', '12:34a.m.'],// '12:34 a.m.', '12:34a.m', '12:34 am.', 'zzz 12:34am zzz'],
        ['1', '1a', '1 a', '1am', '1 am', '1A', '1 AM'],
        ['5', '5a', '5:00 am'],
        ['11', '11a', ' 11a '],
        ['12', '12:00pm'],
        ['13', '1p', '1:00pm', '1p.m.', '1 p.m.', '1P'],
        ['23:59', '11:59pm'],
        ['not', 'a', 'time', 'zzz 12:34am zzz', '1p.', '1pm.'],  // => null
    ]
    console.log('testing parseTime');
    for (let set of equivs) {
        let unixes = set.map(parseTime);
        for (let ii = 0; ii < unixes.length; ii++) {
            if (unixes[0] !== unixes[ii]) {
                expect(unixes[0]).toBe(unixes[ii]);
            }
        }
    }
});
