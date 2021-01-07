<script>
    import { fly, slide, fade, blur} from 'svelte/transition';

    export let rowData;
    export let columnData;
    export let roundedCornerStyle = true;
    export let zebraRowStyle = true;
    export let invertZebraOrder = false;
    export let onRowClickCallback = null;

    const trophyIcons = ['🥇', '🥈', '🥉'];
    
    function getPositionIcon(position) {
        return position <= 2 ? trophyIcons[position] : position + 1;
    }

    function getRowStyle(index, length) {
        let style = 'row';
        let invert = invertZebraOrder ? 1 : 0;

        if (onRowClickCallback)
            style += ' clickable';

        if (roundedCornerStyle && index == 0)
            style += ' first-row';
        else if (roundedCornerStyle && index == length-1)
            style += ' last-row';

        if (zebraRowStyle)
            style += index % 2 == invert ? ' zebra-primary-color' : ' zebra-secondary-color';
        
        return style;
    }

    function onRowClick(data) {
        if (onRowClickCallback)
            onRowClickCallback(data);
    }
</script>


<div in:fly="{{x: -200, duration: 1000}}" out:fade="{{duration: 500}}" class="row header">
    {#each columnData as column}
    <div class="column"
         class:auto-hide={column.autoHide}
         style="flex-grow: {column.sizeProportion};">
         {column.columnTitle}
    </div>
    {/each}
</div>
{#each rowData as rowItem, i}
<div in:fly="{{delay: 50 * (i+1), x: 100, duration: 100}}" out:fade="{{duration: 500}}" class="{getRowStyle(i, rowData.length)}" on:click={onRowClick(rowItem)}>
    {#each columnData as column}   
    <div class="column"
        class:auto-hide={column.autoHide}
        style="flex-grow: {column.sizeProportion};">
        {#if column.format === 'image'}
        <div class="image">
            <img border="0" alt={column.alt} src={rowItem[column.propertyName]} width="100%">
        </div>
        {:else if column.format === 'rank'}
            {#if column.propertyName === '' || !column.propertyName}
                {#if i <= 2}
                <div class="icon">{trophyIcons[i]}</div>
                {:else}
                {i + 1}
                {/if}
            {:else}
                {#if rowItem[column.propertyName] <= 2}
                <div class="icon">{trophyIcons[rowItem[column.propertyName]]}</div>
                {:else}
                {rowItem[column.propertyName] + 1}
                {/if}
            {/if}
        {:else}    
        {rowItem[column.propertyName]}
        {/if}
    </div>
    {/each}
</div>
{/each}


<style>
    .row {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 0.25em 0em;
        width: 100%;
        min-height: 2.5em;
    }

    .column {
        display: flex;
        flex-direction: column;
        flex-basis: 100%;
        flex: 1;
    }

    .header {
        font-style: italic;
        color: white;
        background-color: var(--brand-primary-color);
        border-radius: 2.5em 0em 2.5em 0em;
        min-height: auto;
        cursor: auto;
    }

    .header:hover {
        color: white;
        font-weight: normal;
        border-style: none;
    }

    .clickable {
        cursor: pointer;
    }

    .clickable:hover {
        border-style: none none none solid;
        border-color: var(--brand-primary-color);
        border-width: 0.5em;
        font-weight: bold;
        color: var(--brand-primary-color);
    }

    .first-row {
        border-radius: 0em 2.0em 0em 0em;
    }

    .last-row {
        border-radius: 0em 0em 1em 1em;
    }

    .zebra-primary-color {
        background-color: rgb(255, 255, 255);
    }

    .zebra-secondary-color {
        background-color: rgb(228, 228, 228);
    }

    .auto-hide {
        display: none;
    }

    .icon {
        font-size: 1.4em;
    }
    
    .image {
        width: 32px;
        height: 32px;
        padding-left: 1em;
    }

    img {
        border-radius: 1.25em;
    }

	@media (min-width: 640px) {
		.auto-hide { display: flex; }
        .avatar { width: 40px; height: 40px; }
	}
</style>