<script lang="ts">
    export let indexOfCaptain: number = 0;
    export let playersOnTeam: string[];
    export let teamName: "A"|"B";

    function addPlayer(){
        playersOnTeam = [...playersOnTeam, `Player ${playersOnTeam.length + 1}${teamName}`];
    }

    function removePlayer(i: number){
        playersOnTeam.splice(i, 1);
        playersOnTeam = [...playersOnTeam];
        indexOfCaptain = Math.min(indexOfCaptain, playersOnTeam.length - 1);
    }
</script>

<div class="paper">
    {#each playersOnTeam as player, i}
        <h4>Player {i + 1}</h4>

        <div>
            <label for={`team-${teamName}-player-${i}-name`} style="display: block;">Name:</label>
            <input id={`team-${teamName}-player-${i}-name`} type="text" name={`team-${teamName}-player-${i}-name`} value={player}>
        </div>
  
        <div>
            <input id={`team-${teamName}-captain-${i}`} type="radio" name={`team-${teamName}-captain`} value={player} checked={i === indexOfCaptain}>
            <label for={`team-${teamName}-captain-${i}`} style="display: inline-block; margin-left: 0.8em;">Is team captain?</label>
        </div>

        {#if i > 0}
            <button on:click={(e) => removePlayer(i)}>Remove player</button>
        {/if}
    {/each}
</div>

<div style="height: 16px;"></div>

<button on:click={addPlayer}>Add another player</button>

<style>
    /** @see http://css3.wikidot.com/blog:lined-paper-with-css */
    .paper {
        font: normal 12px/1.5 "Lucida Grande", arial, sans-serif;
        padding: 6px 5px 4px 42px;
        position: relative;
        color: #444;
        line-height: 20px;
        border: 1px solid #d2d2d2;
    
        background: -webkit-gradient(linear, 0 0, 0 100%, from(#d9eaf3), color-stop(4%, #fff)) 0 4px;
        background: linear-gradient(top, #d9eaf3 0%, #fff 8%) 0 4px;
        background-size: 100% 20px;
        border-radius: 3px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.07);
    }
    .paper::before {
        content: '';
        position: absolute;
        width: 4px;
        top: 0;
        left: 30px;
        bottom: 0;
        border: 1px solid;
        border-color: transparent #efe4e4;
    }
</style>