<script>
    import GlobalRanking from './pages/GlobalRanking.svelte';
    import DriverInfo from './pages/DriverInfo.svelte';
	
    export let data;
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
<GlobalRanking {data} on:message={onDriverSelect}></GlobalRanking>
{:else}
<DriverInfo data={driverInfo} on:message={onBack}></DriverInfo>
{/if}
