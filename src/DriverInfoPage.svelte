<script>
    import { createEventDispatcher } from 'svelte';
    import DriverCard from './DriverCard.svelte';
    import DriverResults from './DriverResults.svelte';

    export let data;

	const dispatch = createEventDispatcher();

	function onBack() {
		dispatch('message', {action: 'back'});
	}
</script>


<div class="header">
    <h3>Driver Season Results</h3>
    <button on:click={onBack}>Back</button>
</div>

<div class="content">
    <DriverCard {data}/>
    <DriverResults {data}/>
</div>


<style>
    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: baseline;
        padding: 0.25em 0em;
        width: 100%;
    }

    .header h3 {
        color:rgb(255, 71, 5);
        padding-left: 1em;
        text-align: left;
        /*text-shadow: -1px 0.5px 1px rgb(109, 109, 109);*/
    }

    .header button {
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

    .header button:hover, .header button:focus {
        background-color: rgb(109, 109, 109);
    }

    .content {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        flex-wrap: wrap;
        padding: 0.25em 0em;
        width: 100%;
    }
</style>