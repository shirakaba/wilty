<script lang="ts">
	import { homeTruths, quickFireLies } from "./data";

	const usedHomeTruths = new Set<string>([]);
	const unusedHomeTruths = new Set<string>(...homeTruths);
	const usedQFLs = new Set<string>([]);
	const unusedQFLs = new Set<string>(...quickFireLies);

	let modalVisible: boolean = false;

	function getRandomSetElement<T>(set: Set<T>): T {
		return [...set.keys()][Math.floor(Math.random() * set.size)];
	}

	function promptHomeTruth(e: MouseEvent): void {
		modalVisible = true;

		if(unusedHomeTruths.size === 0){
			alert(`No more distinct statements left in Home Truths! Reshuffling.`);
			unusedHomeTruths.clear();
			homeTruths.forEach(x => unusedHomeTruths.add(x));
		}
		const item: string = getRandomSetElement(unusedHomeTruths);
		usedHomeTruths.add(item);
		unusedHomeTruths.delete(item);

		modalText = item;
	}

	function promptQFL(e: MouseEvent): void {
		modalVisible = true;

		if(unusedQFLs.size === 0){
			alert(`No more distinct statements left in Quick-fire Lies! Reshuffling.`);
			usedQFLs.clear();
			quickFireLies.forEach(x => unusedQFLs.add(x));
		}
		const item: string = getRandomSetElement(unusedQFLs);
		usedQFLs.add(item);
		unusedQFLs.delete(item);

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
	
	<button on:click={promptHomeTruth}>Prompt</button>
	
	<h2>Quick-fire Lies</h2>
	
	<p><strong>Quick-fire Lies</strong> is the second questioning round.</p>

	<button on:click={promptQFL}>Prompt</button>

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