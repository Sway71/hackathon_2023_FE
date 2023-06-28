<script lang="ts">
  async function getBattlesList() {
    const res = await fetch(`http://localhost:4000/api/game`);
    const text = await res.text();
  
    if (res.ok) {
			return res.json();
		} else {
			throw new Error(text);
		}
  }

  let battlesListPromise = getBattlesList();
</script>

<h1>List of active battles should be here!</h1>


<div class="battles-list-container">
  {#await battlesListPromise}
    <p>...loading</p>
  {:then battles}
    {#each battles as battle}
      <div class="battle-row">
        <div class="battle-name">
          {battle.name}
        </div>
        <div class="battle-url">
          <a href={battle.gameUrl}>{battle.gameUrl}</a>
        </div>
      </div>
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
