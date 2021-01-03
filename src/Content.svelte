<script>
	/*async function loadData() {
		const res = await fetch('https://www.dropbox.com/s/ie5fg8mlotjmlzw/drivers_karts_Front.json?dl=0');
		return await res.json();
    }*/
    
    import GeneralRanking from './GeneralRanking.svelte';
    import DriverInfo from './DriverInfo.svelte';
    //import { fly, fade } from 'svelte/transition';
	import * as json from '../public/assets/data.json';

    let testList = [
        {avatar: 'http://placehold.it/64x64', name: 'Kevin', age: 31, team: 'Ferrari'},
        {avatar: 'http://placehold.it/64x64', name: 'Ramón', age: 31, team: 'McClaren'},
        {avatar: 'http://placehold.it/64x64', name: 'Miki', age: 31, team: 'Renault'},
        {avatar: 'http://placehold.it/64x64', name: 'Lisa', age: 31, team: 'Red Bull'},
        {avatar: 'http://placehold.it/64x64', name: 'Pepe', age: 31, team: 'BMW'},
    ];

    let showDriverInfo = false;
    let driverInfo;

    function onDriverSelect(event) {
        showDriverInfo = true;
        driverInfo = { ...event.detail };
    }
    
    function onBack(event) {
        showDriverInfo = false;
    }
</script>

{#if !showDriverInfo}
<GeneralRanking data={testList} on:message={onDriverSelect}></GeneralRanking>
{:else}
<DriverInfo data={driverInfo} on:message={onBack}></DriverInfo>
{/if}
