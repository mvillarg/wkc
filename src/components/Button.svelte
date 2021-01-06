<script>
    export let onClickCallback;
    export let textLabel;
    export let domRef = null;
</script>


<button bind:this={domRef} on:click={onClickCallback}>{textLabel}</button>


<style>
    button {
        background-color: var(--brand-primary-color);
        color: white;
        padding: 0.3em 1em;
        font-size: 1em;
        font-weight: normal;
        border: none;
        cursor: pointer;
        border-radius: 0.25em 0.25em 0.25em 0.25em;
        /*box-shadow: 1px 1px 3px 0px rgb(117, 117, 117);*/
    }

    button:hover, button:focus {
        background-color: var(--brand-secondary-color);
    }
</style>