<script>
    export let data;
    const trophyIcons = ['🥇', '🥈', '🥉'];

    function getTrophyIcon(position) {
        return position <= 2 ? trophyIcons[position] : position + 1;
    }
</script>


<div class="card-header">Driver Card</div>
<div class="card-body">
    <div class="avatar">
        <img border="0" alt={data.name} src={data.picture} width="100%">
    </div>
    
    <div class="title">Name</div>
    <div class="desc">{data.name}</div>

    <div class="title">Age</div>
    <div class="desc">{data.age}</div>

    <div class="title">Team</div>
    <div class="desc">{data.team}</div>

    <div class="title">Global Ranking</div>
    <div class="{data.globalPosition <= 2 ? 'icon' : 'desc'}">{getTrophyIcon(data.globalPosition)}</div>
</div>


<style>
    .card-header {
        font-weight: bold;
        color: white;
        /*border-style: solid solid none solid;*/
        background-color: var(--brand-primary-color);
        border-radius: 1.2em 1.2em 0em 0em;
        padding: 0.25em 0.5em;
    }

    .card-body {
        padding: 0.5em 1em;
    }

    .title {
        color: var(--brand-primary-color);
        font-size: 1em;
        margin-top: 1em;
    }

    .desc {
        color: var(--brand-secondary-color);
        font-weight: normal;
        font-size: 0.8em;
    }

    .icon {
        font-size: 2em;
    }
    
    .avatar {
        width: 96px;
        height: auto;
        margin: auto auto;
        position: relative;
    }

    img {
        border-radius: 0.5em;
        box-shadow: 0px 1px 4px 0px rgba(0,0,0,0.4);
    }
</style>