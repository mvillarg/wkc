<script>
	/*async function loadData() {
		const res = await fetch('https://www.dropbox.com/s/ie5fg8mlotjmlzw/drivers_karts_Front.json?dl=0');
		return await res.json();
	}*/

	export let appName;
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import { fly, fade } from 'svelte/transition';
	import * as json from '../public/assets/data.json';
	//let json = loadData();

	let icons = ['🏎', '🏁', '🏆', '🥇', '🥈', '🥉', '🕑', 'ℹ'];
</script>

<main>
	<Header fullTitle={appName} shortTitle='WKC'></Header>

	<p transition:fly="{{ y: -200, duration: 2000 }}">{json.data[3].age}</p>
	<p transition:fade>HOLA</p>

	<!-- {#await json}
		<p>Waiting...</p>
	{:then json}
		<p>{json.data[1].age}</p>
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await} -->
	<!-- <span>{icons[1]}</span> -->
	<span>{icons[1]}</span>

	<Footer author='Miguel Villar' owner='devaway_'></Footer>
</main>

<style>
	main {
		text-align: center;
		padding: 0.5em 4.0em;
		max-width: 360px;
		margin: 0 auto;
	}

	span {
		position: absolute;
		font-size: 10vw;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>