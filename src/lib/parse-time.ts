import NamedRegExp from 'named-regexp-groups';

export let parseTime = (s : string) : number | null => {
    // parse times like:
    // 1   1a   1 pm   1:00   1:00 p   1:00PM    1 p.m.   1p.m.
    // if am/pm are not specified, interpret it as a 24 hour time (e.g. "11" -> 11am, "12" -> noon, "13" -> 1pm)
    // set the hour and minute of the current day, then convert to unix time and return.
    // the time must be the entire string (except for leading and trailing whitespace)

    //log(`parseTime(${s})`);
    //                         (--12------)(:------------)?sp?(-----ampm-----------------)?
    //                                       (---34-----)      (----a.------)(m-|-.m.--)?
    let rx = new NamedRegExp(/^(:<hr>\d?\d)(:(:<min>\d\d))?\ ?((:<ampm>[ap]?)(m|[.]m[.])?)?$/i);
    s = s.trim().toLowerCase();
    let match = rx.exec(s);
    if (!match) {
        //console.log(s.padEnd(10, ' '), null);
        return null;
    }
    let groups = match.groups;
    let hr = parseInt(groups['hr'], 10);
    let min = parseInt(groups['min'] || '0', 10);
    let am = groups['ampm']; // 'a', 'p', or undefined
    //let debug1 = `-${hr}-${min}-${am}`.padEnd(17, ' ');
    if (am === 'a') {
        // "12a" = hour 0, midnight
        if (hr === 12) { hr = 0; }
    } else if (am && am === 'p') {
        // "12p" = hour 12, noon
        // "1p" = hour 13
        if (hr === 12) { hr = 0; }
        hr += 12;
    } else {
        // 24 hour time, no hacks needed
        // "0" = midnight
        // "12" = noon  // this one is extra ambiguous if not thinking in 24 hour time
    }
    //let debug2 = `-${hr}-${min}-${am}`.padEnd(17, ' ');
    //log(s.padEnd(10, ' '), debug1, debug2);
    let date = new Date();
    date.setHours(hr);
    date.setMinutes(min);
    date.setSeconds(0);
    date.setMilliseconds(0);
    //log(hr, ':', min, am);
    //log(date);
    //log(date.getTime());
    return date.getTime();
}
