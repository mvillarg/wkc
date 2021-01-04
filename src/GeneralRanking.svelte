<script>
	import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';

    export let data;

    let raceSelectId = -1; // -1 == Global Ranking
    let raceSelectName = 'Global Ranking';
    let raceSelector = 'raceSelector';
    const iconStyle = 'column icon';
    const trophyIconsGlobal = ['🏆', '🥈', '🥉']; // ['🏎', '🏁', '🏆', '🥇', '🥈', '🥉', '🕑', 'ℹ'];
    const trophyIconsRace = ['🥇', '🥈', '🥉'];
    const raceList = data[0].races.map((item) => { return item.name }); raceList.unshift(raceSelectName);
	const dispatch = createEventDispatcher();

	function onDriverSelect(driver) {
		dispatch('message', {...driver});
    }
    
    function getRowStyle(index, length, firstRowDark = false, allowRadius = true, allowSolid = true) {
        let style = 'row';
        let dark = firstRowDark ? 0 : 1;

        if (allowRadius && index == 0)
            style += ' first-row';
        else if (allowRadius && index == length-1)
            style += ' last-row';

        if (allowSolid)
            style += index % 2 == dark ? ' solid-dark' : ' solid-light';
        
        return style;
    }

    function getTrophyIcon(position) {
        if (raceSelectId < 0)
            return position <= 2 ? trophyIconsGlobal[position] : position + 1;
        else
            return position <= 2 ? trophyIconsRace[position] : position + 1;
    }

    function getTimeInMilliseconds(time) {
        // Client time format is "1:11:39.515"
        let timeSplit = time.split(':');
        let hours = parseInt(timeSplit[0]) * 60 * 60 * 1000;
        let minutes = parseInt(timeSplit[1]) * 60 * 1000;
        let seconds = parseInt(timeSplit[2].split('.'[0])) * 1000;
        let milliseconds = parseInt(timeSplit[2].split('.'[1]));

        return hours + minutes + seconds + milliseconds;
    }

    function sortDriversList() {
        if (raceSelectId < 0) // Global rankings
        {
            data = data.sort((a,b) => {
                let overallTimeA = a.races.reduce((total, curr) => {
                    total = typeof(total) === 'Number' ? total : 0;
                    return total + getTimeInMilliseconds(curr.time);
                });

                let overallTimeB = b.races.reduce((total, curr) => {
                    total = typeof(total) === 'Number' ? total : 0;
                    return total + getTimeInMilliseconds(curr.time);
                });

                return overallTimeA - overallTimeB; // Ascending order
            });
        }
        else // Specific race ranking
        {
            data = data.sort((a,b) => {
                let raceTimeA = getTimeInMilliseconds(a.races[raceSelectId].time);
                let raceTimeB = getTimeInMilliseconds(b.races[raceSelectId].time);

                return raceTimeA - raceTimeB; // Ascending order
            });
        }
    }

    function onDropdownClick() {
        raceSelector.classList.toggle('show');
    }

    function onWindowClick(event) {
        if (!event.target.matches('.dropdown-button')) {
            if (raceSelector.classList.contains('show'))
                raceSelector.classList.remove('show');
        }
    }

    function onSelectRaceId(raceId) {
        raceSelectId = raceId - 1;
        raceSelectName = raceList[raceId];
        sortDriversList(raceId - 1);
    }

    onMount(() => {
        sortDriversList();
        raceSelector = document.getElementById("raceSelector");
	});
    
</script>

<svelte:window on:click={onWindowClick}/>

<div class="container-header">
    <h3>{raceSelectName}</h3>
    <div class="dropdown">
        <button on:click="{onDropdownClick}" class="dropdown-button">Select Race</button>
        <div class="dropdown-content" id="{raceSelector}">
        {#each raceList as race, i}
            <a on:click="{() => { onSelectRaceId(i) }}" href="#">{race}</a>
        {/each}
        </div>
    </div>
</div>

<div class="container-table">
    <div class="row header">
        <div class="column" style="flex-grow: 1;"> </div>
        <div class="column" style="flex-grow: 1;">Rank</div>
        <div class="column" style="flex-grow: 3;">Name</div>
        <div class="column auto-hide" style="flex-grow: 2;">Team</div>
    </div>
    {#each data as driver, i}
    <div class="{getRowStyle(i, data.length, true)}" on:click={onDriverSelect(driver)}>
        <div class="column" style="flex-grow: 1;">
            <div class="avatar">
                <img border="0" alt={driver.name} src={driver.picture} width="100%">
            </div>
        </div>
        <div class="{i <= 2 ? iconStyle : 'column'}" style="flex-grow: 1;">{getTrophyIcon(i)}</div>
        <div class="column" style="flex-grow: 3;">{driver.name}</div>
        <div class="column auto-hide" style="flex-grow: 2;">{driver.team}</div>
    </div>
    {/each}
</div>

<style>

    .container-header {
        display:flex;
        flex-direction: row;
        justify-content:space-between;
        align-items:baseline;
        padding: 0.25em 0.5em;
        width: 100%;
    }

    .container-header h3 {
        color:rgb(255, 71, 5);
        text-shadow: -1px 0.5px 1px rgb(109, 109, 109);
        padding-left: 1em;
        text-align: left;
    }

    .dropdown-button {
        background-color: rgb(255, 71, 5);
        color: white;
        padding: 0.3em 1em;
        font-size: 1em;
        font-weight: normal;
        border: none;
        cursor: pointer;
        border-radius: 0.25em 0.25em 0.25em 0.25em;
        box-shadow: 1px 1px 3px 0px rgb(117, 117, 117);
    }

    .dropdown-button:hover, .dropdown-button:focus {
        background-color: rgb(109, 109, 109);
    }

    .dropdown {
        position: relative;
        display: block;
        float: right;
    }

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f1f1f1;
        min-width: 5em;
        width: 100%;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    .dropdown-content a {
        color: rgb(90, 90, 90);
        font-size: 0.9em;
        padding: 0.7em 0.7em;
        text-decoration: none;
        display: block;
    }

    .dropdown-content a:hover {
        background-color: rgb(200, 200, 200)
    }

    .show {
        display: block;
    }

    .container-table {
        margin: 0.5em;
    }

    .row {
        display:flex;
        flex-direction: row;
        justify-content: space-around;
        align-items:center;
        padding: 0.25em 0.5em;
        width: 100%;
        cursor: pointer;
    }

    .row:hover {
        border-style: none none none solid;
        border-color: rgb(255, 71, 5);
        border-width: 0.5em;
    }

    .column {
        display: flex;
        flex-direction: column;
        flex-basis: 100%;
        flex: 1;
    }

    .header {
        font-weight: lighter;
        color: white;
        background-color: rgb(255, 71, 5);
        border-radius: 2.5em 0em 2.5em 0em;
        cursor: auto;
    }

    .header:hover {
        border-style: none;
    }

    .first-row {
        border-radius: 0em 2.0em 0em 0em;
    }

    .last-row {
        border-radius: 0em 0em 0.5em 0.5em;
    }

    .solid-light {
        background-color: rgb(231, 231, 231);
    }

    .solid-dark {
        background-color: rgb(223, 223, 223);
    }

    .auto-hide {
        display: none;
    }

    .icon {
        font-size: 1.4em;
    }
    
    .avatar {
        width: 32px;
        height: 32px;
    }

    img {
        border-radius: 0.25em;
    }

	@media (min-width: 640px) {
		.auto-hide { display: flex; }
        .row { padding: 0.25em 0.9em; }
        .avatar { width: 40px; height: 40px; }
	}

</style>