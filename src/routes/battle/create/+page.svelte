<script lang="ts">
  let battleName = "";
  let battleSize = 8;
  let newGameData = {
    gameId: 0,
    gameName: "",
    gameUrl: "",
    player1Token: "",
    player2Token: "",
  }
  const battlefieldBaseUrl = "http://localhost:5173/battlefield"

  async function createBattle() {
    if (battleName) {
      const res = await fetch(
        `http://localhost:4000/api/game`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: battleName,
            size: battleSize,
          })
        }
      );

      battleName = "";

      if (res.ok) {
        newGameData = await res.json();
        window.localStorage.setItem("playerToken", newGameData.player1Token);
        console.log(newGameData);
      } else {
        console.log("need to fix the endpoint probably...")
      }
    }

  }
</script>

<h1>Create Battle</h1>

<div>
  <form on:submit|preventDefault={createBattle}>
    <label for="battleName">Battle name:</label>
    <input id="battleName" bind:value={battleName} type="text">

    <label for="battleSize">Battle size:</label>
    <input id="battleSize" bind:value={battleSize} type="text">

    <button type="submit">
      Create BATTLE!!!
    </button>
  </form>
</div>

{#if newGameData.gameUrl}
  <div class="backdrop"></div>

  <div class="game-data-modal">
    <h3>
      Game, <a href={`${battlefieldBaseUrl}/${newGameData.gameName}?battleId=${newGameData.gameId}`}>{newGameData.gameName}</a>, has been created!
    </h3>

    <div>
      Invite link: {`${battlefieldBaseUrl}/${newGameData.gameName}?battleId=${newGameData.gameId}&playerToken=${newGameData.player2Token}`}
    </div>

  </div>
{/if}

<style lang="scss">
  .backdrop {
    background-color: #444;
    opacity: .3;

    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
  }

  .game-data-modal {
    background-color: #f5f5f5;
    border: 1px solid #444;
    box-shadow: 4px 4px 4px #222;
    font-family: 'Courier New', Courier, monospace;
    height: 14rem;
    width: 24rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1.5rem;
    position: absolute;
    left: calc(50% - 12rem);
    top: calc(50% - 7rem);
    z-index: 100;
  }
</style>
