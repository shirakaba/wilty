<script lang="ts">
    export let indexOfCaptain: number = 0;
    export let playersOnTeam: string[];
    export let teamStatementsRaw: string[];
    export let teamName: "A"|"B";

    function makePlaceholderPlayerName(i: number): string {
        return `Player ${i + 1}${teamName}`;
    }

    function editPlayerName(i: number, value: string): void {
        playersOnTeam[i] = value;
        playersOnTeam = [...playersOnTeam];
    }

    function editStatementList(playerIndex: number, value: string): void {
        teamStatementsRaw.splice(playerIndex, 1, value);
        teamStatementsRaw = [...teamStatementsRaw];
    }

    function addPlayer(): void {
        playersOnTeam = [...playersOnTeam, makePlaceholderPlayerName(playersOnTeam.length)];
        teamStatementsRaw = [...teamStatementsRaw, ""];
    }

    function removePlayer(i: number){
        playersOnTeam.splice(i, 1);
        playersOnTeam = [...playersOnTeam];
        indexOfCaptain = Math.min(indexOfCaptain, playersOnTeam.length - 1);

        teamStatementsRaw.splice(i, 1);
        teamStatementsRaw = [...teamStatementsRaw];
    }
</script>

<div class="paper">
    {#each playersOnTeam as player, i}
        <h4>Player #{i + 1}</h4>

        <div>
            <label>
                Name:
                <input type=text on:input={(e) => editPlayerName(i, e.target.value)} style="margin-right: 0.8em;" value={player} placeholder={makePlaceholderPlayerName(i)}>
            </label>
        </div>

        <div>
            <label>
                <input type=radio bind:group={indexOfCaptain} value={i} style="margin-right: 0.8em;">
                Is team captain?
            </label>
        </div>

        <div style="height: 8px;"></div>

        <div>
            <label style="display: block;">
                Statements (optional). <em>Separate each statement with <code style="background-color: lightgrey; padding-left: 0.25em; padding-right: 0.25em;">===</code></em>:
                <textarea
                    type=textarea
                    on:input={(e) => editStatementList(i, e.target.value)}
                    style="display: block;"
                    value={teamStatementsRaw[i]}
                    placeholder="I once..."
                ></textarea>
            </label>
        </div>

        <div style="height: 8px;"></div>

        {#if i > 0}
            <button on:click={(e) => removePlayer(i)}>Remove player</button>
        {/if}

        {#if i === playersOnTeam.length -1}
            <div style="height: 16px;"></div>
            
            <button on:click={addPlayer}>Add another player</button>
        {/if}
    {/each}
</div>


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