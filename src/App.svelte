<script lang="ts">
	import { homeTruths, quickFireLies } from "./data";

	const usedHomeTruthsA = new Set<string>([]);
	const unusedHomeTruthsA = new Set<string>(homeTruths.keys());
	const usedHomeTruthsB = new Set<string>([]);
	const unusedHomeTruthsB = new Set<string>(homeTruths.keys());

	const usedQFLsA = new Set<string>([]);
	const unusedQFLsA = new Set<string>(quickFireLies.keys());
	const usedQFLsB = new Set<string>([]);
	const unusedQFLsB = new Set<string>(quickFireLies.keys());

	let modalVisible: boolean = false;

	function getRandomSetElement<T>(set: Set<T>): T {
		return [...set.keys()][Math.floor(Math.random() * set.size)];
	}

	interface PromptArgs {
		label: string,
		team: "A"|"B",
		source: Set<string>,
		used: Set<string>,
		unused: Set<string>,
	}

	function prompt(args: PromptArgs): void {
		const { source, used, unused, label, team } = args;

		modalVisible = true;

		if(unused.size === 0){
			alert(`No more distinct statements left in ${label} for team ${team}! Reshuffling.`);
			unused.clear();
			source.forEach(x => unused.add(x));
		}
		const item: string = getRandomSetElement(unused);
		used.add(item);
		unused.delete(item);

		modalText = item;
	}
	
	function onWindowClick(e: MouseEvent): void {
		if(e.target === modalEle){
			modalVisible = false;
		}
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

	<h2>Home Truths</h2>

	<p><strong>Home Truths</strong> is the opening round of the show.</p>
	
	<button class="purpleTeam" on:click={(e) => prompt({ label: "Home Truths", source: homeTruths, used: usedHomeTruthsA, unused: unusedHomeTruthsA, team: "A" })}>Prompt for <strong>Team A</strong></button>
	<button class="greenTeam" on:click={(e) => prompt({ label: "Home Truths", source: homeTruths, used: usedHomeTruthsB, unused: unusedHomeTruthsB, team: "B" })}>Prompt for <strong>Team B</strong></button>
	
	<h2>Quick-fire Lies</h2>
	
	<p><strong>Quick-fire Lies</strong> is the second questioning round.</p>

	<button class="purpleTeam" on:click={(e) => prompt({ label: "Quick-fire Lies", source: quickFireLies, used: usedQFLsA, unused: unusedQFLsA, team: "A" })}>Prompt for <strong>Team A</strong></button>
	<button class="greenTeam" on:click={(e) => prompt({ label: "Quick-fire Lies", source: quickFireLies, used: usedQFLsB, unused: unusedQFLsB, team: "B" })}>Prompt for <strong>Team B</strong></button>

	<footer>
		<em><small>This website is not affiliated with <em>Would I Lie to You?</em>.</small></em>
	</footer>

	<!-- The Modal -->
	<div bind:this={modalEle} class="modal" style={`display: ${modalVisible ? "block" : "none"};`}>
		<!-- Modal content -->
		<div class="modal-content">
			<span on:click={(e) => modalVisible = false} class="close">&times;</span>
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

	main {
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
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