<script>
	import { createEventDispatcher } from 'svelte';

    export let data;

    const darkRow = 'row solid-dark';
    const lightRow = 'row solid-light';
    const iconStyle = 'column icon';
    const medalIcons = ['🥇', '🥈', '🥉']; // ['🏎', '🏁', '🏆', '🥇', '🥈', '🥉', '🕑', 'ℹ'];
	const dispatch = createEventDispatcher();

	function onDriverSelect(driver) {
		dispatch('message', {...driver});
    }
    
    function getRowStyle(index, length, firstRowDark = false, allowRadius = true, allowSolid = true)
    {
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
    
</script>

<h3>Global Ranking</h3>

<div class="containerTable">
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
                <img border="0" alt={driver.name} src={driver.avatar} width="100%">
            </div>
        </div>
        <div class="{i <= 2 ? iconStyle : 'column'}" style="flex-grow: 1;">{i <= 2 ? medalIcons[i] : i+1}</div>
        <div class="column" style="flex-grow: 3;">{driver.name}</div>
        <div class="column auto-hide" style="flex-grow: 2;">{driver.team}</div>
    </div>
    {/each}
</div>

<style>
    h3 {
        color:rgb(255, 71, 5);
        text-shadow: 0px -1px 1px dimgrey;
    }

    .containerTable {
        margin: 0.5em;
    }
    .row {
        display:flex;
        flex-direction: row;
        justify-content:space-around;
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
		.auto-hide{ display: flex; }
        .row { padding: 0.25em 0.9em; }
        .avatar { width: 40px; height: 40px;}
	}

</style>