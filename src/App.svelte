<script>
	import { onMount } from 'svelte';
	import AppRouting from './AppRouting.svelte';
	import ResponsiveTitle from './components/ResponsiveTitle.svelte';
	import Footer from './components/Footer.svelte';
	import { cacheDriversSortListByRace, cacheDriversSortListGlobally} from './data/data-sorting.js';
	import * as clientData from './data/data.json';

	export let appLongName;
	export let appShortName;
	let data = clientData.data;

	onMount(() => {
        for(let i = 0; i < data[0].races.length; i++) {
            cacheDriversSortListByRace(data, i);
        }
        
        cacheDriversSortListGlobally(data);
	});
</script>


<!--
{#await promise}
	<p>...waiting</p>
	<svg>spinner</svg>
{:then data}
-->
	<main>
		<ResponsiveTitle longTitle={appLongName} shortTitle={appShortName}/>
		<AppRouting {data}/>
		<Footer author="Miguel Villar" owner="devaway_"/>
	</main>
<!--
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
-->


<style>
	main {
		text-align: center;
		padding: 0.5em 1.0em;
		max-width: 360px;
		margin: 0 auto;
	}

	/* Global CSS varaibles */
	:global(:root) {
		--brand-primary-color:rgb(255, 71, 5);
		--brand-secondary-color: rgb(109, 109, 109);
	}

	/* Make this app responsive */
	@media (min-width: 640px) {
		main { max-width: 640px; }
	}
</style>