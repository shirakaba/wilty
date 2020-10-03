<script lang="ts">
	import { homeTruths, quickFireLies } from "./data";
	import TeamForm from "./TeamForm.svelte";
	import type { Statements } from "./Statements";

	let startingTeam: "A"|"B" = "A";
	let playerOrder: "random"|"numeric" = "numeric";

	let round: number = 0;
	let roundName: "Home Truths"|"Quick-fire Lies";
	$: {
		roundName = round % 2 === 0 ? "Home Truths" : "Quick-fire Lies";
	}
	let turn: number = 0;
	let currentTeam: "A"|"B" = startingTeam;
	let classForCurrentTeam: "purpleTeam"|"greenTeam";
	let classForInterrogatingTeam: "purpleTeam"|"greenTeam";
	let interrogatingTeam: "A"|"B";
	let promptCommitted: boolean = false;
	let turnFinished: boolean = false;
	$: {
		interrogatingTeam = currentTeam === "A" ? "B" : "A";
		classForCurrentTeam = currentTeam === "A" ? "purpleTeam" : "greenTeam";
		classForInterrogatingTeam = currentTeam === "A" ? "greenTeam" : "purpleTeam";
	}

	let playerA: number = 0;
	let playersOnTeamA: string[] = ["Player 1A"];
	let teamStatementsA: Statements[];
	let teamAPoints: number = 0;
	let teamACaptainIndex: number = 0;
	let teamAAnswererHistory: number[] = [];
	let teamACurrentPlayerIndex: number;
	$:{
		teamACurrentPlayerIndex = playerOrder === "numeric" ? 0 : getRandomInt(0, playersOnTeamA.length - 1);
	}
	let teamAAnswer: "truth"|"lie"|"pending" = "pending";

	let playerB: number = 0;
	let playersOnTeamB: string[] = ["Player 1B"];
	let teamStatementsB: Statements[];
	let teamBPoints: number = 0;
	let teamBCaptainIndex: number = 0;
	let teamBAnswererHistory: number[] = [];
	let teamBCurrentPlayerIndex: number = playerOrder === "numeric" ? 0 : 1;
	$:{
		teamBCurrentPlayerIndex = playerOrder === "numeric" ? 0 : getRandomInt(0, playersOnTeamB.length - 1);
	}
	let teamBAnswer: "truth"|"lie"|"pending" = "pending";

	let currentPlayer: string;
	$:{
		currentPlayer = currentTeam === "A" ? playersOnTeamA[teamACurrentPlayerIndex] : playersOnTeamB[teamBCurrentPlayerIndex];
	}
	let currentTeamAnswer: "truth"|"lie"|"pending";
	$: {
		currentTeam === "A" ? teamAAnswer : teamBAnswer;
	}
	let awaitingSpeakerAnswer: boolean;
	$: {
		awaitingSpeakerAnswer = (currentTeam === "A" && teamBAnswer !== "pending") || (currentTeam === "B" && teamAAnswer !== "pending")
	}
	let lastAwardedTeam: "A"|"B"|"pending" = "pending";
	let lastAwardedReason: "correct_answer"|"successful_trick"|"pending" = "pending";

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

	function promptForCurrentTurn(): void {
		prompt({ label: roundName, commonStatements: roundName === "Home Truths" ? homeTruthsCommon : QFLsCommon, teamStatements: currentTeam === "A" ? teamStatementsA : teamStatementsB, playerIndex: currentTeam === "A" ? playerA : playerB, team: currentTeam });
	}

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
		promptCommitted = true;
		modalVisible = false;
	}

	function onSpeakersAnswer(reality: "truth"|"lie"): void {
		// currentTeam means the team that have spoken the statement.
		if(currentTeam === "A"){
			// Team B are interrogating Team A.
			if(teamBAnswer === reality){
				awardPointToTeam(interrogatingTeam, "correct_answer");
			} else {
				awardPointToTeam(currentTeam, "successful_trick");
			}
		} else {
			// Team A are interrogating Team B.
			if(teamAAnswer === reality){
				awardPointToTeam(interrogatingTeam, "correct_answer");
			} else {
				awardPointToTeam(currentTeam, "successful_trick");
			}
		}

		turnFinished = true;
	}

	function awardPointToTeam(team: "A"|"B", reason: "correct_answer"|"successful_trick"): void {
		lastAwardedTeam = team;
		lastAwardedReason = reason;

		if(team === "A"){
			// awardMessage = `Well done Team `
			teamAPoints++;
		} else {
			teamBPoints++;
		}
	}

	function getRandomElementFromArray<T>(items: T[]): T {
		return items[getRandomInt(0, items.length)];
	}

	function rotatePlayer(onTeam: "A"|"B"): void {
		if(onTeam === "A"){
			if(playerOrder === "numeric"){
				teamACurrentPlayerIndex = (teamACurrentPlayerIndex + 1) % playersOnTeamA.length;
			} else {
				// Exclude previous answerers from becoming next player.
				if(playersOnTeamA.length > 1 && teamAAnswererHistory.length > 0){
					const playerIndices = playersOnTeamA.map((name, i) => i);
					const playersExceptLastOne = playerIndices.filter((index) => index !== teamAAnswererHistory[teamAAnswererHistory.length - 1]);
					teamACurrentPlayerIndex = getRandomElementFromArray(playersExceptLastOne);
				}
			}
		} else {
			if(playerOrder === "numeric"){
				teamBCurrentPlayerIndex = (teamBCurrentPlayerIndex + 1) % playersOnTeamB.length;
			} else {
				// Exclude previous answerers from becoming next player.
				if(playersOnTeamB.length > 1 && teamBAnswererHistory.length > 0){
					const playerIndices = playersOnTeamB.map((name, i) => i);
					const playersExceptLastOne = playerIndices.filter((index) => index !== teamBAnswererHistory[teamBAnswererHistory.length - 1]);
					teamBCurrentPlayerIndex = getRandomElementFromArray(playersExceptLastOne);
				}
			}
		}
	}

	function resetAnswers(): void {
		teamAAnswer = "pending";
		teamBAnswer = "pending";
	}

	function nextTurn(): void {
		turn++;

		resetAnswers();
		
		rotatePlayer(interrogatingTeam);
		turnFinished = false;
		promptCommitted = false;
		currentTeam = interrogatingTeam; // interrogatingTeam will switch reactively.
	}

	/**
	 * At the end of each answer, the host should pick one of either "next turn" or "next round".
	 * As nextRound() inherits all the same nextTurn() behaviour, this prevents rotating players twice.
	 */
	function nextRound(): void {
		nextTurn();
		turn = 0;

		round++;
	}

	let modalEle: HTMLDivElement;
	let modalText: string = "";
</script>
<svelte:window on:click={onWindowClick}/>

<main>
	<h1>Would I Lie to You Prompter</h1>
	
	<p>This site generates prompts for two rounds of the British TV panel show, <em>Would I Lie To You?</em>: <strong>Home Truths</strong> and <strong>Quick-fire Lies</strong>.</p>

	<p>Although originally distinguished by a difference in pace of questioning, these two rounds are now effectively played in the same way.</p>
	
	<p>Panellists are chosen at random. A panellist reads out a statement about themselves and the oposing teams have to decide whether it is true or a lie. The opposing team are allowed to interrogate the panellist reading the statement, and if it's a lie, the panellist must think of responses on the spot to convince the other team that it is true.</p>

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

	<section>
		<h2>Game dashboard</h2>
		<!-- <h3 style="margin-top: 8px;">Game status</h3> -->

		<table class="gameStatusTable">
			<tr>
				<th rowspan="2">Round</th>
				<th>№</th>
				<td>
					<span>{round + 1}</span>
				</td>
			</tr>
			<tr>
				<th>Name</th>
				<td>
					<span>{round % 2 === 0 ? "Home Truths" : "Quick-fire Lies"}</span>
				</td>
			</tr>
			<tr>
				<th colspan="2">Turn</th>
				<td>{turn + 1}</td>
			</tr>
			<tr>
				<th colspan="2">Team</th>
				<td class={classForCurrentTeam}>{currentTeam}</td>
			</tr>
			<tr>
				<th colspan="2">Player</th>
				<td class={classForCurrentTeam}>{currentPlayer}</td>
			</tr>
			<tr>
				<th rowspan="2">Scores</th>
				<th class="purpleTeam">Team A</th>
				<td>
					<span>{teamAPoints}</span>
				</td>
			</tr>
			<tr>
				<th class="greenTeam">Team B</th>
				<td>
					<span>{teamBPoints}</span>
				</td>
			</tr>
		</table>
	</section>

	<!-- Home Truths: B2, A2 -->
	<!-- QFLs: B1, B0,  -->

	<!-- Teams swap on each turn. -->
	<!-- Rounds are time-limited to 10-15 mins. -->
	<!-- At least QFLs appears to allow players to take a turn more than once during a round. -->

	<!-- Home Truths: B2, A0, B0 -->
	<!-- QFLs: B1, A1, B2, A2, A1  -->

	<section style={`opacity: ${promptCommitted ? 0.75 : 1}`}>
		<h2>Start-of-round</h2>
		
		<h3>{roundName}</h3>

		{#if roundName === "Home Truths"}
			<p><strong>Home Truths</strong> is the opening round of the show.</p>
		{:else}
			<p><strong>Quick-fire Lies</strong> is the second questioning round.</p>
		{/if}

		<button
			class={classForCurrentTeam}
			on:click={(e) => {
				if(promptCommitted){
					modalVisible = true;
				} else {
					promptForCurrentTurn();
				}
			}}
		>
			{#if promptCommitted}
				Show prompt for <strong>{currentPlayer}</strong> on <strong>Team {currentTeam}</strong> again
			{:else}
				Prompt for <strong>{currentPlayer}</strong> on <strong>Team {currentTeam}</strong>
			{/if}
		</button>
	</section>

	{#if promptCommitted}
		<section style={`opacity: ${turnFinished ? 0.75 : 1}`}>
			<h2>End-of-round</h2>

			<section style={`opacity: ${!turnFinished && awaitingSpeakerAnswer ? 0.75 : 1}`}>
				<h3 style="margin-top: 8px;">Examiners' conclusion</h3>
		
				<p>Does <strong class={classForInterrogatingTeam}>Team {interrogatingTeam}</strong> think <strong class={classForCurrentTeam}>{currentPlayer}</strong>'s statement is a <strong>truth</strong> or a <strong>lie</strong>?</p>
		
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label style="display: block;">
					{#if currentTeam === "A"}
						<input type=radio bind:group={teamBAnswer} value={"pending"} style="margin-left: 0.25em;">
					{:else}
						<input type=radio bind:group={teamAAnswer} value={"pending"} style="margin-left: 0.25em;">
					{/if}
					Pending
				</label>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label style="display: block;">
					{#if currentTeam === "A"}
						<input type=radio bind:group={teamBAnswer} value={"truth"} style="margin-left: 0.25em;">
					{:else}
						<input type=radio bind:group={teamAAnswer} value={"truth"} style="margin-left: 0.25em;">
					{/if}
					Truth
				</label>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label style="display: block;">
					{#if currentTeam === "A"}
						<input type=radio bind:group={teamBAnswer} value={"lie"} style="margin-left: 0.25em;">			
					{:else}
						<input type=radio bind:group={teamAAnswer} value={"lie"} style="margin-left: 0.25em;">
					{/if}
					Lie
				</label>
			</section>

			{#if awaitingSpeakerAnswer}
				<section>
					<h3 style="margin-top: 8px;">Speaker's answer</h3>
		
					<p>Was <strong class={classForCurrentTeam}>{currentPlayer}</strong>'s statement a <strong>truth</strong> or a <strong>lie</strong>?</p>
		
					{#if !turnFinished}
						<button
							class="truth"
							on:click={(e) => onSpeakersAnswer("truth")}
						>
							Truth
						</button>
			
						<button
							class="lie"
							on:click={(e) => onSpeakersAnswer("lie")}
						>
							Lie
						</button>
					{/if}
				</section>
			{/if}
		</section>
	{/if}

	{#if turnFinished}
		<section>
			<h2>Continue</h2>

			<p>Well done <span>Team {lastAwardedTeam}</span> for <span>{lastAwardedReason === "correct_answer" ? `correctly answering that the statement was a` : `tricking the opposing team into thinking the statement was a`}{currentTeamAnswer}!</span></p>

			{#if round % 2 === 0}
				<p>There are normally 2-3 turns of Home Truths before the Quick-fire Lies round.</p>
			{:else}
				<p>There are normally 3-4 turns of Quick-fire lies before the Home Truths round.</p>
			{/if}

			<p>This will of course depend on the time taken by the answerers; normally about ten minutes is allocated to the round.</p>

			<button
				on:click={(e) => nextTurn()}
			>
				Next Turn
			</button>

			<button
				on:click={(e) => nextRound()}
			>
				Next Round
			</button>
		</section>
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
			{#if !promptCommitted}
				<button on:click={() => promptForCurrentTurn()}>Re-prompt</button>
			{/if}
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

	.gameStatusTable > tr > th {
		border-bottom: 1px solid gray;
		text-align: right;
	}

	.gameStatusTable > tr > td {
		text-align: center;
	}

	.gameStatusTable > tr:first-child > td,
	.gameStatusTable > tr:first-child > th {
		border-top: 1px solid gray;
	}

	.gameStatusTable > tr > td {
		border-bottom: 1px solid gray;
	}

	.truth {
		background-color: rgb(0,255,0);
	}

	.lie {
		background-color: rgb(255,0,255);
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