<script>
	/*async function loadData() {
		const res = await fetch('https://www.dropbox.com/s/ie5fg8mlotjmlzw/drivers_karts_Front.json?dl=0');
		return await res.json();
    }*/
    
    import GeneralRanking from './GeneralRanking.svelte';
    import DriverInfo from './DriverInfo.svelte';
    //import { fly, fade } from 'svelte/transition';
	import * as clientData from './data.json';

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
<GeneralRanking data={clientData.data} on:message={onDriverSelect}></GeneralRanking>
{:else}
<DriverInfo data={driverInfo} on:message={onBack}></DriverInfo>
{/if}
