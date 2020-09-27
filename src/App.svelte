<script lang="ts">
	import { homeTruths, quickFireLies } from "./data";
	import TeamForm from "./TeamForm.svelte";
	import type { Statements } from "./Statements";

	let startingTeam: "A"|"B" = "A";
	let playerOrder: "random"|"numeric" = "numeric";

	let round: number = 0;
	let turn: number = 0;
	let currentTeam: "A"|"B" = startingTeam;

	let playerA: number = 0;
	let playersOnTeamA: string[] = ["Player 1A"];
	let teamStatementsA: Statements[];
	let teamACaptainIndex: number = 0;
	let teamAAnswererHistory: number[] = [];
	let teamACurrentPlayerIndex: number;
	$:{
		teamACurrentPlayerIndex = playerOrder === "numeric" ? 0 : getRandomInt(0, playersOnTeamA.length - 1);
	}

	let playerB: number = 0;
	let playersOnTeamB: string[] = ["Player 1B"];
	let teamStatementsB: Statements[];
	let teamBCaptainIndex: number = 0;
	let teamBAnswererHistory: number[] = [];
	let teamBCurrentPlayerIndex: number = playerOrder === "numeric" ? 0 : 1;
	$:{
		teamBCurrentPlayerIndex = playerOrder === "numeric" ? 0 : getRandomInt(0, playersOnTeamB.length - 1);
	}

	let currentPlayer: string;
	$:{
		currentPlayer = currentTeam === "A" ? playersOnTeamA[teamACurrentPlayerIndex] : playersOnTeamB[teamBCurrentPlayerIndex];
	}

	const homeTruthsCommon: Statements = {
		source: homeTruths,
		used: new Set<string>(),
		unused: new Set<string>(homeTruths.keys()),
	};
	const QFLsCommon: Statements = {
		source: quickFireLies,
		used: new Set<string>(),
		unused: new Set<string>(quickFireLies.keys()),
	};

	let modalVisible: boolean = false;

	function getRandomInt(min: number, max: number): number {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function getRandomSetElement<T>(set: Set<T>): T {
		return [...set.keys()][Math.floor(Math.random() * set.size)];
	}

	interface PromptArgs {
		label: string,
		team: "A"|"B",
		playerIndex: number,
		commonStatements: Statements,
		teamStatements: Statements[],
	}

	const preferPlayerStatements: boolean = true;

	function prompt(args: PromptArgs): void {
		const { label, team, playerIndex, commonStatements, teamStatements } = args;

		let item: string;
		const playerStatements = teamStatements[playerIndex];
	
		if(playerStatements?.unused.size && (preferPlayerStatements ? true : Math.random() < 0.5)){
			// Pick a player statement. Player statements may be true or false. Player statements never get shuffled.
			item = getRandomSetElement(playerStatements!.unused);
			playerStatements!.used.add(item);
			playerStatements!.unused.delete(item);
		} else {
			// Pick a common statement, which will always be false.
			const { used, unused, source } = commonStatements;
			if(unused.size === 0){
				console.warn(`No more distinct statements left in ${label}! Reshuffling.`);
				used.clear();
				source.forEach(x => unused.add(x));
			}
			item = getRandomSetElement(unused);
			used.add(item);
			unused.delete(item);
			// TODO: persist the used common statements into LocalStorage to prevent two concurrent rounds from reusing statements.
		}

		if(team === "A"){
			teamAAnswererHistory = [...teamAAnswererHistory, playerIndex];
		} else {
			teamBAnswererHistory = [...teamBAnswererHistory, playerIndex];
		}

		modalVisible = true;
		modalText = item;
	}

	function onWindowClick(e: MouseEvent): void {
		if(e.target === modalEle){
			closeModal();
		}
	}

	function closeModal(): void {
		modalVisible = false;
	}

	let modalEle: HTMLDivElement;
	let modalText: string = "";
</script>
<svelte:window on:click={onWindowClick}/>

<main>
	<h1>Would I Lie to You Prompter</h1>
	
	<p>This site generates prompts for two rounds of the British TV panel show, <em>Would I Lie To You?</em>: <strong>Home Truths</strong> and <strong>Quick-fire Lies</strong>.</p>

	<p>Although originally distinguished by a difference in pace of questioning, these two rounds are now effectively played in the same way.</p>
	
	<p>Panellists are chosen at random. A panellist reads out a statement about themselves and the oposing teams have to decide whether it is true or a lie. The opposing team are allowed to interrogate the panellist reading the statement, and if its a lie, the panellist must think of responses on the spot to convince the other team that it is true.</p>

	<h2>Player registration</h2>

	<details>
		<div style="height: 8px;"></div>

		<summary>Click to toggle visibility</summary>

		<section class="teamFormContainer purpleTeam">
			<h3 style="margin-top: 8px;">Team A</h3>

			<label style="display: block;">
				Is starting team?
				<input type=radio bind:group={startingTeam} value={"A"} style="margin-left: 0.25em;">
			</label>
	
			<TeamForm
				playersOnTeam={playersOnTeamA}
				bind:teamStatements={teamStatementsA}
				indexOfCaptain={teamACaptainIndex}
				teamName="A"
			/>
		</section>

		<section class="teamFormContainer greenTeam">
			<h3 style="margin-top: 8px;">Team B</h3>

			<label style="display: block;">
				Is starting team?
				<input type=radio bind:group={startingTeam} value={"B"} style="margin-left: 0.25em;">
			</label>

			<TeamForm
				playersOnTeam={playersOnTeamB}
				bind:teamStatements={teamStatementsB}
				indexOfCaptain={teamBCaptainIndex}
				teamName="B"
			/>
		</section>

		<section>
			<h3 style="margin-top: 8px;">Player order</h3>
			<label style="display: block;">
				Numeric
				<input type=radio bind:group={playerOrder} value={"numeric"} style="margin-left: 0.25em;">
			</label>
			<label style="display: block;">
				Random
				<input type=radio bind:group={playerOrder} value={"random"} style="margin-left: 0.25em;">
			</label>
		</section>
	</details>

	<h2>Game dashboard</h2>

	<table class="gameStatusTable">
		<tr>
			<td>Round</td>
			<td>{round + 1} ({round % 2 === 0 ? "Home Truths" : "Quick-fire Lies"})</td>
		</tr>
		<tr>
			<td>Turn</td>
			<td>{turn + 1}</td>
		</tr>
		<tr>
			<td>Team</td>
			<td class={currentTeam === "A" ? "purpleTeam" : "greenTeam"}>{currentTeam}</td>
		</tr>
		<tr>
			<td>Player</td>
			<td class={currentTeam === "A" ? "purpleTeam" : "greenTeam"}>{currentPlayer}</td>
		</tr>
	</table>


	<!-- Home Truths: B2, A2 -->
	<!-- QFLs: B1, B0,  -->

	<!-- Teams swap on each turn. -->
	<!-- Rounds are time-limited to 10-15 mins. -->
	<!-- At least QFLs appears to allow players to take a turn more than once during a round. -->

	<!-- Home Truths: B2, A0, B0 -->
	<!-- QFLs: B1, A1, B2, A2, A1  -->

	{#if round % 2 === 0}
		<h2>Home Truths</h2>

		<p><strong>Home Truths</strong> is the opening round of the show.</p>
		
		{#if currentTeam === "A"}
			<button
				class="purpleTeam"
				on:click={(e) => prompt({ label: "Home Truths", commonStatements: homeTruthsCommon, teamStatements: teamStatementsA, playerIndex: playerA, team: "A" })}
			>
				Prompt for <strong>{currentPlayer}</strong> on <strong>Team A</strong>
			</button>
		{:else}
			<button
				class="greenTeam"
				on:click={(e) => prompt({ label: "Home Truths", commonStatements: homeTruthsCommon, teamStatements: teamStatementsB, playerIndex: playerB, team: "B" })}
			>
				Prompt for <strong>{currentPlayer}</strong> on <strong>Team B</strong>
			</button>
		{/if}
	{:else}
		<h2>Quick-fire Lies</h2>
		
		<p><strong>Quick-fire Lies</strong> is the second questioning round.</p>

		{#if currentTeam === "A"}
			<button
				class="purpleTeam"
				on:click={(e) => prompt({ label: "Quick-fire Lies", commonStatements: QFLsCommon, teamStatements: teamStatementsA, playerIndex: playerA, team: "A" })}
			>
				Prompt for <strong>{currentPlayer}</strong> on <strong>Team A</strong>
			</button>
		{:else}
			<button
				class="greenTeam"
				on:click={(e) => prompt({ label: "Quick-fire Lies", commonStatements: QFLsCommon, teamStatements: teamStatementsB, playerIndex: playerB, team: "B" })}
			>
				Prompt for <strong>{currentPlayer}</strong> on <strong>Team B</strong>
			</button>
		{/if}
	{/if}	

	<footer>
		<em><small>This website is not affiliated with <em>Would I Lie to You?</em>.</small></em>
	</footer>

	<!-- The Modal -->
	<div bind:this={modalEle} class="modal" style={`display: ${modalVisible ? "block" : "none"};`}>
		<!-- Modal content -->
		<div class="modal-content">
			<span on:click={(e) => closeModal()} class="close">&times;</span>
			<p>{modalText}</p>
		</div>
	</div>
</main>

<style>
	.purpleTeam {
		color: black;
		background: linear-gradient(to right, rgba(255,0,255), rgba(0,255,255));
	}

	.greenTeam {
		color: black;
		background: linear-gradient(to right, rgba(0,255,255), rgba(0,255,0));
	}

	.teamFormContainer {
		padding: 8px;
	}

	.gameStatusTable {
		border-spacing: 4px;
	}

	.gameStatusTable > tr > td:nth-child(1){
		text-align: right;
		font-weight: bold;
	}

	.gameStatusTable > tr > td:nth-child(2){
		text-align: center;
	}

	main {
		padding: 1em;
		margin: 0 auto;
		max-width: 960px;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}


	/* The Modal (background) */
	.modal {
		position: fixed; /* Stay in place */
		z-index: 1; /* Sit on top */
		padding-top: 100px; /* Location of the box */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		overflow: auto; /* Enable scroll if needed */
		background-color: rgb(0,0,0); /* Fallback color */
		background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
	}

	/* Modal Content */
	.modal-content {
		background-color: #fefefe;
		margin: auto;
		padding: 20px;
		border: 1px solid #888;
		width: 80%;
	}

	/* The Close Button */
	.close {
		color: #aaaaaa;
		float: right;
		font-size: 28px;
		font-weight: bold;
	}

	.close:hover,
	.close:focus {
		color: #000;
		text-decoration: none;
		cursor: pointer;
	}
</style>