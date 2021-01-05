<script>
	/*async function loadData() {
		const res = await fetch('https://www.dropbox.com/s/ie5fg8mlotjmlzw/drivers_karts_Front.json?dl=0');
		return await res.json();
    }*/
    
    import { onMount } from 'svelte';
    import GlobalRankingPage from './GlobalRankingPage.svelte';
    import DriverInfoPage from './DriverInfoPage.svelte';
    //import { fly, fade } from 'svelte/transition';
	import * as clientData from './data.json';

    let showDriverInfo = false;
    let driverInfo;
    let data = clientData.data;
    const raceList = data[0].races.map((item) => { return item.name });
    raceList.unshift('Global');

    function getTimeInMilliseconds(time) {
        // Client time format is like this: "1:11:39.515"
        let timeSplit = time.split(':');
        let hours = parseInt(timeSplit[0]) * 60 * 60 * 1000;
        let minutes = parseInt(timeSplit[1]) * 60 * 1000;
        let seconds = parseInt(timeSplit[2].split('.'[0])) * 1000;
        let milliseconds = parseInt(timeSplit[2].split('.'[1]));

        return hours + minutes + seconds + milliseconds;
    }

    function cacheDriversSortListByRace(raceId) {       
        data.sort((a,b) => {
            let raceTimeA = getTimeInMilliseconds(a.races[raceId].time);
            let raceTimeB = getTimeInMilliseconds(b.races[raceId].time);
            return raceTimeA - raceTimeB; // Ascending order
        });

        // Position data caching
        data.forEach((driver, position) => { driver.races[raceId].position = position + 1 });
    }

    function cacheDriversSortListGlobally() {
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
        data.forEach((driver, position) => { driver.globalPosition = position + 1 });
    }

    function cacheDriversSortList() {
        for(let i = 0; i < raceList.length-1; i++) {
            cacheDriversSortListByRace(i);
        }

        cacheDriversSortListGlobally();
        
        //console.log(JSON.stringify(data));
    }

    function onDriverSelect(event) {
        showDriverInfo = true;
        driverInfo = { ...event.detail };
    }
    
    function onBack(event) {
        showDriverInfo = false;
    }

    onMount(() => {
        cacheDriversSortList();
	});
</script>

{#if !showDriverInfo}
<GlobalRankingPage {data} {raceList} on:message={onDriverSelect}></GlobalRankingPage>
{:else}
<DriverInfoPage data={driverInfo} on:message={onBack}></DriverInfoPage>
{/if}
