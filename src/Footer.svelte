<script>
    export let year = '2021';
    export let author;
    export let owner;
</script>

<hr>
<p>Copyright {year} by <i>{author}</i>, prepared for <span>{owner}</span> using <a href="https://svelte.dev/tutorial">Svelte</a></p>

<style>
    p {
        font-size: 0.75em;
    }
    span {
        font-family: Tahoma;
        font-weight: bold;
        color: orangered;
    }

    hr {
        background-color: rgb(255, 162, 146);
        border-style: ridge;
        margin-top: 2em;
        width: 90%;
    }  
</style>