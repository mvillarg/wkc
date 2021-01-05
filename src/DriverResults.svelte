<script>
    export let data;
    const trophyIcons = ['🥇', '🥈', '🥉'];

    function getTrophyIcon(position) {
        return position <= 3 ? trophyIcons[position-1] : position;
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
</script>


<div class="table-container">
    <div class="row header">
        <div class="column" style="flex-grow: 1;">Race</div>
        <div class="column" style="flex-grow: 1;">Position</div>
        <div class="column" style="flex-grow: 2;">Time</div>
    </div>
    {#each data.races as race, i}
    <div class="{getRowStyle(i, data.races.length, true, true, false)}">
        <div class="column" style="flex-grow: 1;">{race.name}</div>
        <div class="{race.position <= 3 ? 'column icon' : 'column'}" style="flex-grow: 1;">{getTrophyIcon(race.position)}</div>
        <div class="column" style="flex-grow: 2;">{race.time}</div>
    </div>
    {/each}
</div>


<style>
    .table-container {
        width: 100%;
        /*border-style: solid;
        border-color: rgb(255, 71, 5);
        border-width: 2px;
        border-radius: 1.5em 1.5em 1em 1em;*/
    }

    .row {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 0.25em 0em;
        width: 100%;
        background-color: rgb(223, 223, 223);
        /*box-shadow: 0px 2px 16px 4px rgba(0,0,0,0.2);*/
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
        border-radius: 1.5em 1.5em 0em 0em;
        cursor: auto;
    }

    .first-row {
        /*border-radius: 0em 2.0em 0em 0em;*/
    }

    .last-row {
        border-radius: 0em 0em 0.5em 0.5em;
        padding-bottom: 0.5em;
    }

    .solid-light {
        background-color: rgb(255, 226, 206);
    }

    .solid-dark {
        background-color: rgb(255, 238, 218);
    }

    .icon {
        font-size: 1.4em;
    }
    
	@media (min-width: 640px) {
        .table-container { width: 60%; }
    }

</style>