<script>
    import { fly } from 'svelte/transition';

    export let fullTitle;
    export let shortTitle;

    let titleWords = fullTitle.split(' ');
    let titleChars = shortTitle.split('');
    let capitals = [];

    titleChars.forEach( (item, index) => { capitals.push({c: item, x: (index+1) * -100}) });

    console.log(titleChars);
</script>

<h1 class="full-text">
    {#each titleWords as w}
    {w.charAt(0)}<span class="non-capital">{w.substring(1)} &nbsp</span>
    {/each}
</h1>

<div class="brief-text">
    {#each capitals as c}
    <h1 transition:fly="{{ x: c.x, duration: 2000 }}">{c.c} &nbsp</h1>
    {/each}
</div>

<!-- <h1 class="short-text" transition:fly="{{ x: -500, duration: 2000 }}">{shortTitle}</h1> -->
<!-- <p transition:fix(fade)="{{ duration: 2000 }}">hola</p> -->

<style>
    /*@font-face {
  		font-family: 'FasterFont';
  		src: url('/assets/FasterOne-Regular.ttf') format('truetype');
	}*/

    @font-face {
        font-family: 'Faster';
        font-weight: 400;
        font-style: normal;
        font-display: swap; /* Read next point */
        unicode-range: U+000-5FF; /* Download only latin glyphs */
        src: local('Faster'), url('/assets/FasterOne-Regular.ttf') format('truetype');
    }

	h1 {
        display: inline-block;
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
        font-style: normal;
		font-family: Faster;
        margin-top: 0.25em;
	}

	.non-capital {
        font-family: Calibri; /*Verdana;*/
        font-weight: bold;
        font-style: italic;
        font-size: 0.75em;
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