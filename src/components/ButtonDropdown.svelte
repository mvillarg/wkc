<script>
    import Button from '../components/Button.svelte';

    export let textLabel;
    export let items;
    export let onSelectCallback;

    let show = false;
    let buttonElementRef = null;

    function onDropdownClick() {
        show = true;
    }

    function onWindowClick(event) {
        // If the click occurs outside the button...
        if (event.target !== buttonElementRef) 
            show = show ? false : show;
    }
</script>


<svelte:window on:click={onWindowClick}/>

<div class="dropdown">
    <Button bind:domRef={buttonElementRef} onClickCallback={onDropdownClick} {textLabel}/>
    <div class="dropdown-content" class:show="{show === true}">
        {#each items as item, i}
            <a on:click="{() => { onSelectCallback(i) }}" href="#">{item}</a>
        {/each}
    </div>
</div>


<style>
    .dropdown {
        position: relative;
        display: block;
        float: right;
    }

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f1f1f1;
        min-width: 6em;
        width: 100%;
        box-shadow: 0px 0px 18px 4px rgba(0,0,0,0.2);
        z-index: 1;
    }

    .dropdown-content a {
        color: rgb(90, 90, 90);
        font-size: 0.9em;
        padding: 0.7em 0.7em;
        text-decoration: none;
        display: block;
    }

    .dropdown-content a:hover {
        background-color: rgb(200, 200, 200);
    }

    .show {
        display: block;
    }    
</style>