async function getBattle(gameId: number) {
  const res = await fetch(`http://localhost:4000/api/game/${gameId}`,)

  if (res.ok) {
    const battle =  await res.json();
    return battle;
  } else {
    console.log('fetch getBattle failed')
  }
}

async function createBattle(battleName: string, battleSize: number) {
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

    if (res.ok) {
      const newGameData = await res.json();
      return newGameData
    } else {
      console.log("need to fix the endpoint probably...")
    }
  }

}

// async function getMovableTiles(
//   battleId: number,
//   characterSlot: number,
// ) {
//   const res = await fetch(
//     `http://localhost:4000/api/game/movable_tiles`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         battleId,
//         characterSlot: characterSlot,
//         playerToken: localStorage.getItem("playerToken")
//       })
//     }
//   );

//   if (res.ok) {
//     const movableTilesRes = await res.json();
//     return movableTilesRes;
//   } else {
//     console.log("need to fix the getMovableTiles endpoint probably...");
//   }
// }