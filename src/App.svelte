<script>
	/*async function loadData() {
		const res = await fetch('https://www.dropbox.com/s/ie5fg8mlotjmlzw/drivers_karts_Front.json?dl=0');
		return await res.json();
	}*/

	export let appLongName;
	export let appShortName;
	import Header from './Header.svelte';
	import Content from './Content.svelte';
	import Footer from './Footer.svelte';
</script>

<main>
	<Header longTitle={appLongName} shortTitle={appShortName}></Header>
	<Content/>
	<Footer author='Miguel Villar' owner='devaway_'></Footer>
</main>

<style>
	main {
		text-align: center;
		padding: 0.5em 2.0em;
		max-width: 360px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: 640px;
		}
	}
</style>