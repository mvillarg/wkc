function getTimeInMilliseconds(time) {
    // Client time format is like this: "1:11:39.515"
    let timeSplit = time.split(':');
    let hours = parseInt(timeSplit[0]) * 60 * 60 * 1000;
    let minutes = parseInt(timeSplit[1]) * 60 * 1000;
    let seconds = parseInt(timeSplit[2].split('.'[0])) * 1000;
    let milliseconds = parseInt(timeSplit[2].split('.'[1]));

    return hours + minutes + seconds + milliseconds;
}

export function cacheDriversSortListByRace(data, raceId) {       
    data.sort((a,b) => {
        let raceTimeA = getTimeInMilliseconds(a.races[raceId].time);
        let raceTimeB = getTimeInMilliseconds(b.races[raceId].time);
        return raceTimeA - raceTimeB; // Ascending order
    });

    // Position data caching
    data.forEach((driver, position) => { driver.races[raceId].position = position });
}

export function cacheDriversSortListGlobally(data) {
    data.sort((a,b) => {
        let totalPositionsA = a.races.reduce((total, curr) => {
            total = typeof(total) === 'Number' ? total : 0;
            return total + curr.position;
        });

        let totalPositionsB = b.races.reduce((total, curr) => {
            total = typeof(total) === 'Number' ? total : 0;
            return total + curr.position;
        });

        return totalPositionsA - totalPositionsB; // Ascending order
    });

    // Position data caching
    data.forEach((driver, position) => { driver.globalPosition = position });
}