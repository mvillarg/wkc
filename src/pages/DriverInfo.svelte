<script>
    import { createEventDispatcher } from 'svelte';
    import { fly, slide} from 'svelte/transition';
    import DriverCard from '../components/DriverCard.svelte';
    import ScoreTable from '../components/ScoreTable.svelte';
    import Subtitle from '../components/Subtitle.svelte';
    import Button from '../components/Button.svelte';
    
    export let data;

    const dispatch = createEventDispatcher();

	function onBack() {
		dispatch('message', {action: 'back'});
	}
</script>


<div class="flex-container v-align-baseline">
    <Subtitle text="Driver Season Results"/>
    <Button onClickCallback={onBack} textLabel="Back"/>
</div>

<div class="flex-container flex-wrap">
    <div class="card-container" in:fly="{{x: -400, duration: 1000}}" out:slide="{{duration:500}}">
        <DriverCard {data}/>
    </div>
    <div class="table-container" in:fly="{{x: 1000, duration: 1000}}" out:slide="{{duration:500}}">
        <ScoreTable rowData={data.races} columnData={[
            { columnTitle: 'Race',     propertyName: 'name',     format: 'text', sizeProportion: 1 },
            { columnTitle: 'Position', propertyName: 'position', format: 'rank', sizeProportion: 1 },
            { columnTitle: 'Time',     propertyName: 'time',     format: 'text', sizeProportion: 2 },
            ]} roundedCornerStyle={true} zebraRowStyle={true}/>
    </div>
</div>


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

    .flex-wrap {
        flex-wrap: wrap;
    }

    .card-container {
        width: 100%;
        height: 0%;
        margin-right: 0em;
        margin-bottom: 2em;
        border-style: solid;
        border-color: var(--brand-primary-color);
        border-width: 2px;
        border-radius: 1.5em 1.5em 1em 1em;
        /*box-shadow: 0px 2px 16px 4px rgba(0,0,0,0.2);*/
        /*background-color: rgb(201, 201, 201);*/
    }

    .table-container {
        width: 100%;
    }

    @media (min-width: 640px) {
        .card-container {
            margin-right: 2em;
            margin-bottom: 0em;
            width: 30%;
        }
        .table-container { width: 60%; }
    }
</style>