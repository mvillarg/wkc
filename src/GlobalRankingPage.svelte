<script>
	import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';

    export let data;
    export let raceList;

    let raceSelectId = -1; // -1 == Global Ranking
    let raceSelector = 'raceSelector';
    let rankingTitle = prefixRankingTitle + raceList[0];
    const prefixRankingTitle = 'Ranking / ';
    const iconStyle = 'column icon';
    const trophyIconsGlobal = ['🏆', '🥈', '🥉']; // ['🏎', '🏁', '🏆', '🥇', '🥈', '🥉', '🕑', 'ℹ'];
    const trophyIconsRace = ['🥇', '🥈', '🥉'];
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

    function sortDriversTable() {
        if (raceSelectId < 0) // Global rankings
        {
            data = data.sort((a,b) => {
                return a.globalPosition - b.globalPosition; // Ascending order
            });
        }
        else // Specific race ranking
        {
            data = data.sort((a,b) => {
                return a.races[raceSelectId].position - b.races[raceSelectId].position; // Ascending order
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
        rankingTitle = prefixRankingTitle + raceList[raceId];
        sortDriversTable();
    }

    onMount(() => {
        sortDriversTable();
        raceSelector = document.getElementById("raceSelector");
	});
</script>

<svelte:window on:click={onWindowClick}/>

<div class="container-header">
    <h3>{rankingTitle}</h3>
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
    <div class="{getRowStyle(i, data.length, false)}" on:click={onDriverSelect(driver)}>
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
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: baseline;
        padding: 0.25em 0em;
        width: 100%;
    }

    .container-header h3 {
        color:rgb(255, 71, 5);
        /*text-shadow: -1px 0.5px 1px rgb(109, 109, 109);*/
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
        /*box-shadow: 1px 1px 3px 0px rgb(117, 117, 117);*/
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
        /*margin: 0em;*/
    }

    .row {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 0.25em 0em;
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
        background-color: rgb(255, 255, 255);
    }

    .solid-dark {
        background-color: rgb(228, 228, 228);
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
        padding-left: 1em;
    }

    img {
        border-radius: 1.25em;
    }

	@media (min-width: 640px) {
		.auto-hide { display: flex; }
        .avatar { width: 40px; height: 40px; }
	}

</style>