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

	let icons = ['🏎', '🏁', '🏆', '🥇', '🥈', '🥉', '🕑', 'ℹ'];
</script>

<main>
	<Header longTitle={appName} shortTitle='WKC'></Header>

	<p>{json.data[3].age}</p>

	<span>{icons[1]}</span>

	<Footer author='Miguel Villar' owner='devaway_'></Footer>
</main>

<style>
	main {
		text-align: center;
		padding: 0.5em 2.0em;
		max-width: 360px;
		margin: 0 auto;
	}

	span {
		position: absolute;
		font-size: 5vw;
	}

	@media (min-width: 640px) {
		main {
			max-width: 640px;
		}
	}
</style>