<script>
	import { createEventDispatcher } from 'svelte';

    export let data = { name: '', Age: 0 };

	const dispatch = createEventDispatcher();

	function onBack() {
		dispatch('message', {action: 'back'});
	}
</script>

<h3>Driver Information</h3>

<button on:click={onBack}>Back</button>
<p>Name: {data.name}</p>
<p>Age: {data.age}</p>

<style>
    h3 {
        color:rgb(255, 71, 5);
        text-shadow: 0px -1px 1px dimgrey;
    }

    button {
        align-self: start;
    }
</style>