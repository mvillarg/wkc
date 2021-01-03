<script>
    import { fade, fly } from 'svelte/transition';

    export let longTitle;
    export let shortTitle;

    const titleWords = longTitle.split(' ');
    const titleChars = shortTitle.split('');
    const capitalsFull = [];
    const capitalsShort = [];
    const space = '\xa0\xa0\xa0'; // JS's '\xa0' == &nbsp in HTML

    titleWords.forEach( (item, index) => { capitalsFull.push({c: item, x: (index+1) * -100}) });
    titleChars.forEach( (item, index) => { capitalsShort.push({c: item, x: (index+1) * -100}) });
</script>

<div class="full-text">
    {#each capitalsFull as w}
    <h1 transition:fly="{{ x: w.x, duration: 2000 }}">{w.c.charAt(0)}</h1>
    <span class="non-capital" transition:fade="{{ duration: 1500 }}">{w.c.substring(1)}{w.x >= -200 ? space : ''}</span>
    {/each}
</div>

<div class="brief-text">
    {#each capitalsShort as c}
    <h1 transition:fly="{{ x: c.x, duration: 2000 }}">{c.c}{c.x >= -200 ? space : ''}</h1>
    {/each}
</div>

<style>
    @font-face {
        font-family: 'Faster';
        font-weight: 100;
        font-style: normal;
        font-display: swap; /* Read next point */
        unicode-range: U+000-5FF; /* Download only latin glyphs */
        src: local('Faster'), url('/assets/FasterOne-Regular.ttf') format('truetype');
        /*src: local('Faster'), url('assets/FasterOne-Regular.ttf') format('truetype'); /*TODO: Enable this for 'npm run build'*/
    }

	h1 {
        display: inline-block;
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 3em;
		font-weight: 100;
        font-style: normal;
		font-family: Faster;
        margin-top: 0.25em;
        margin-bottom: 0.25em;
	}

	.non-capital {
        color:rgb(102, 102, 102);
        font-family: Calibri; /*Verdana;*/
        text-transform: uppercase;
        font-weight: bold;
        font-style: italic;
        font-size: 2.2em;
        margin-left: -0.1em;
    }

    .full-text {
        display: none;
    }

    .brief-text {
        display: inline-block;
        margin-top: 0em;
    }

	@media (min-width: 640px) {
		.full-text { display: inline-block; }
        .brief-text { display: none; }
	}
</style>