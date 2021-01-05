<script>
    export let data;
    const trophyIcons = ['🥇', '🥈', '🥉'];

    function getTrophyIcon(position) {
        return position <= 3 ? trophyIcons[position-1] : position;
    }
</script>


<div class="card-container">
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
        <div class="{data.globalPosition <= 3 ? 'icon' : 'desc'}">{getTrophyIcon(data.globalPosition)}</div>
    </div>
</div>


<style>
    .card-container {
        width: 100%;
        margin-right: 0em;
        margin-bottom: 2em;
        border-style: solid;
        border-color: rgb(255, 71, 5);
        border-width: 2px;
        /*box-shadow: 0px 2px 16px 4px rgba(0,0,0,0.2);*/
        border-radius: 1.5em 1.5em 1em 1em;
        /*background-color: rgb(201, 201, 201);*/
    }

    .card-header {
        font-weight: lighter;
        color: white;
        /*border-style: solid solid none solid;*/
        background-color: rgb(255, 71, 5);
        border-radius: 1.2em 1.2em 0em 0em;
        padding: 0.25em 0.5em;
    }

    .card-body {
        padding: 0.5em 1em;
    }

    .title {
        color:rgb(255, 71, 5);
        font-size: 1em;
        margin-top: 1em;
    }

    .desc {
        color:rgb(107, 107, 107);
        font-weight: lighter;
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

    @media (min-width: 640px) {
		.card-container {
            margin-right: 2em;
            margin-bottom: 0em;
            width: 30%;
        }
	}
</style>