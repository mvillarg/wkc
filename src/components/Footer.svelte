<script>
    export let year = '2021';
    export let author;
    export let owner;
</script>


<hr>
<p>© <i>{year} {author}</i>, prepared for <span>{owner}</span> using <a href="https://svelte.dev/tutorial">Svelte</a></p>


<style>
    p {
        font-size: 0.75em;
    }
    
    span {
        font-family: Tahoma;
        font-weight: bold;
        color: var(--brand-primary-color);
    }

    hr {
        border-style: solid;
        border-width: 1px;
        border-color: var(--brand-primary-color);
        background-color: var(--brand-primary-color);
        margin-top: 2em;
        width: 90%;
    }  
</style>