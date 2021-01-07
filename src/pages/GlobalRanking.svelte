<script>
	import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';
    import { fly, slide} from 'svelte/transition';

    import ScoreTable from '../components/ScoreTable.svelte';
    import Subtitle from '../components/Subtitle.svelte';
    import ButtonDropdown from '../components/ButtonDropdown.svelte';
    
    export let data;
    
    const raceList = data[0].races.map((item) => { return item.name });
    raceList.unshift('Global');

    let raceId = -1; // -1 == Global Ranking
    let selectId = raceId;
    let rankingTitle = prefixRankingTitle + raceList[0];
    const prefixRankingTitle = 'Ranking / ';
	const dispatch = createEventDispatcher();

	function onDriverSelect(driver) {
		dispatch('message', {...driver});
    }

    function sortDriversTable() {
        if (raceId < 0) // Global rankings
        {
            data = data.sort((a,b) => {
                return a.globalPosition - b.globalPosition; // Ascending order
            });
        }
        else // Specific race ranking
        {
            data = data.sort((a,b) => {
                return a.races[raceId].position - b.races[raceId].position; // Ascending order
            });
        }
    }

    function onSelectRaceId(id) {
        selectId = id - 1;
    }

    function updateRaceId() {
        raceId = selectId;
        rankingTitle = prefixRankingTitle + raceList[raceId + 1];
        sortDriversTable();
    }

    onMount(() => {
        sortDriversTable();
	});
</script>


<div class="flex-container v-align-baseline">
    <Subtitle text={rankingTitle}/>
    <ButtonDropdown textLabel="Select Race" items={raceList} onSelectCallback={onSelectRaceId}/>
</div>

{#if raceId === selectId}
<div in:slide="{{duration: 2500}}" out:slide="{{duration: 500}}">
<ScoreTable rowData={data} columnData={[
    { columnTitle: '',     propertyName: 'picture', format: 'image', sizeProportion: 1, alt: "Driver's picture" },
    { columnTitle: 'Rank', propertyName: undefined, format: 'rank',  sizeProportion: 1 },
    { columnTitle: 'Name', propertyName: 'name',    format: 'text',  sizeProportion: 3 },
    { columnTitle: 'Team', propertyName: 'team',    format: 'text',  sizeProportion: 2, autoHide: true },
    ]} onRowClickCallback={onDriverSelect} roundedCornerStyle={true} zebraRowStyle={true}/>
</div>
{:else}
{updateRaceId()}
{/if}


<style>
    .flex-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0.25em 0em;
        width: 100%;
    }

    .v-align-baseline {
        align-items: baseline;
    }
</style>