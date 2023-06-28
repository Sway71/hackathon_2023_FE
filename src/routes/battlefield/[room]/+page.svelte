<script lang="ts">
    import { onMount } from 'svelte';
    import { initChat } from '../../../sockets/chatSocket';
    import chatStore from '../../../stores/chatStore';
    import { gameDataStore } from '../../../stores/battleStore';
    import { isInTiles } from '../../../utils/gameboardUtils';
    import type { BattleData } from '../../../types/boardTypes';
    import { isPlayerTurn } from '../../../utils/gameboardUtils';

    export let data;

    async function getBattle(id: string, playerToken: string) {
        const res = await fetch(
            `http://localhost:4000/api/game/${id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Player-Token": playerToken,
                },
            }
        )

        if (res.ok) {
            const battle = await res.json();
            return battle;
        } else {
            console.log('fetch getBattle failed')
            return {};
        }
    }

    let gameId = "";
    let battleData: BattleData;
    let channel;
    let message: string;
	let messages: string[] = [];

    gameDataStore.subscribe((battleStoreData) => {
        console.log('battleStoreData', battleStoreData);
        battleData = battleStoreData;
        battleData = battleData
    })

    onMount(() => {
        // TODO: clean this token stuff up
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('playerToken')) {
            window.localStorage.setItem("playerToken", urlParams.get('playerToken') || '')
        }
        const playertoken = window.localStorage.getItem("playerToken");
        gameId = urlParams.get('battleId') || '';

        channel = initChat(data.room);
        channel.on("move_update", (moveResponse) => {
            gameDataStore.update((battleStore: BattleData) => {
                // console.log('moveResponse', moveResponse)
                console.log(
                    "characters filter check",
                    battleStore.activeSlot,
                    battleStore.characters,
                    battleStore.characters.filter((char) => char.slot !== battleStore.activeSlot),
                )
                return {
                    ...battleStore,
                    gameBoard: {
                        ...battleStore.gameboard,
                        layout: {...moveResponse.layout},
                    },
                    characters: [
                        ...battleStore.characters.filter((char) => char.slot !== battleStore.activeSlot),
                        {
                            ...moveResponse.character,
                            slot: battleStore.activeSlot
                        }
                    ],
                    activeSlot: moveResponse.activeSlot,
                    activeTiles: []
                }
            })
        })
        chatStore.subscribe((updatedMessages: string[]) => {
			messages = updatedMessages;
		})

        if (gameId) {
            getBattle(gameId, playertoken).then((battle) => {
                gameDataStore.update((battleStore: BattleData) => {
                    if (battle.id) {
                        const { character1, character2 } = battle;
                        const char1Key = `${character1.x}_${character1.y}`
                        const char2Key = `${character2.x}_${character2.y}`
                        const layout = {
                            ...battle.layout,
                            [char1Key]: 'character_1',
                            [char2Key]: 'character_2'
                        }
                        const newState = {
                            ...battleStore,
                            name: battle.gameName,
                            commander: battle.commander,
                            activeSlot: parseInt(battle.activeSlot),
                            phase: battle.phase,
                            characters: [
                                {
                                    ...battle.character1,
                                    slot: 1
                                },
                                {
                                    ...battle.character2,
                                    slot: 2
                                },
                            ],
                            gameBoard: {
                                height: 8,
                                width: 8,
                                layout: layout,
                            },
                        };
                        
                        return newState;
                    } else {
                        return battleStore;
                    }
                })
            })
        }
    })

    const onSendMessage = () => {
        if (message.length > 0) {
            channel.push('shout', {name: "bob", message})
            message = "";
        }
	}

    const handleTileClick = (x: number, y: number) => {
        channel.push(
            'move_request',
            {
                battleId: gameId,
                characterSlot: battleData.activeSlot,
                playerToken: localStorage.getItem("playerToken"),
                moveToSpace: [x, y],
            },
        ).receive('ok', (moveResponse) => {
            gameDataStore.update((battleStore: BattleData) => {
                // console.log('moveResponse', moveResponse)
                return {
                    ...battleStore,
                    gameBoard: {
                        ...battleStore.gameboard,
                        layout: {...moveResponse.layout},
                    },
                    characters: [
                        ...battleStore.characters.filter((char) => char.slot !== battleStore.activeSlot),
                        {
                            ...moveResponse.character,
                            slot: battleData.activeSlot
                        }
                    ],
                    activeSlot: moveResponse.activeSlot,
                    activeTiles: []
                }
            })
        })
    }

    async function handleMoveClicked(characterSlot: number) {
        channel.push(
            'check_movement',
            {
                battleId: gameId,
                characterSlot: characterSlot,
                playerToken: localStorage.getItem("playerToken"),
            }
        ).receive('ok', ({movableSpaces}: {movableSpaces: number[][]}) => {
            gameDataStore.update((battleStore: BattleData) => {
                return {
                    ...battleStore,
                    activeTiles: movableSpaces
                }
            })
        })
    }

    async function handleAttackClicked() {
        console.log('import the requester [handleAttackClicked]')
    }

</script>

{#if battleData.commander && isPlayerTurn(battleData.commander, battleData.characters, battleData.activeSlot)}
    <div class="actions-menu">
        <div on:click={() => handleMoveClicked(battleData.activeSlot)}>Move</div>
        <div on:click={handleAttackClicked}>Attack</div>
    </div>
{/if}

<div class="battle-ui-container">
    <h1>Welcome to Battle, {data.room}</h1>

    <div class="battle-content-wrapper">
        <div class="gameboard-wrapper">
            <div class="gameboard-container">
                {#each [...Array(8).keys()] as y}
                    <div class="gameboard-row">
                        {#each [...Array(8).keys()] as x (`board_cell-${x}_${y}`)}
                            {#if battleData?.gameBoard.layout[`${x}_${y}`] && battleData.gameBoard.layout[`${x}_${y}`].includes('character')}
                                <div
                                    class="gameboard-tile"
                                    on:click={() => handleTileClick(x, y)}
                                    on:keydown={() => console.log('keydown event!')}
                                >
                                    <img
                                        src="/images/knight_1.png"
                                        alt="a knight"
                                        class="character"
                                    >
                                    {#if battleData.activeSlot.toString() === battleData.gameBoard.layout[`${x}_${y}`].split('_')[1]}
                                        <div class="diamond-holder">
                                            <div class="active-character-diamond"></div>
                                        </div>
                                    {/if}
                                </div>
                            {:else}
                                <div
                                    class="gameboard-tile"
                                    on:click={() => handleTileClick(x, y)}
                                    on:keydown={() => console.log('keydown event!')}
                                >
                                    {#if isInTiles([x, y], battleData.activeTiles)}
                                        <div class="tile-hightlight"></div>
                                    {/if}
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/each}
            </div>
        </div>

        <div class="chat-wrapper">
            <div>
                Need some chat stuff here
            </div>
        
            <form on:submit|preventDefault={onSendMessage}>
                <input type="text" bind:value={message} />
        
                <button on:click={onSendMessage}>
                    Send
                </button>
            </form>
        </div>
    </div>
</div>

<style lang="scss">
    .gameboard-container {
        align-items: center;
        display: flex;
        flex-direction: column;
        transform: skew(-25deg);
    }

    .gameboard-row {
        display: flex;
        flex-direction: row;
    }

    .gameboard-tile {
        background-color: #3b3b3b;
        border-radius: .25rem;
        box-shadow: 4px 4px 4px #777;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 3rem;
        width: 5rem;
        margin: .25rem;
        z-index: 10;

        &:hover {
            background-color: #4b4b4b;
            border: .125rem solid #7bd3eb;
            margin: .125rem;
        }
    }

    .tile-hightlight {
        background-color: #54b6d1;
        border-radius: .5rem;
        height: 2rem;
        width: 3.25rem;
        opacity: .5;
    }

    .character {
        position: absolute;
        height: 4.25rem;
        pointer-events: none;
        transform: skew(25deg);
        z-index: 150;
        top: -1.875rem;
        left: 0rem;
    }

    .active-character-diamond {
        background-color: #fdff88;
        position: absolute;
        height: 1rem;
        width: .625rem;
        pointer-events: none;
        transform: skew(25deg) rotate(45deg);
        z-index: 150;
        // top: -2.875rem;
        // left: .25rem;
    }

    .diamond-holder {
        position: absolute;
        height: .75rem;
        width: .75rem;
        pointer-events: none;
        top: -2.875rem;
        left: .25rem;
        animation: spin 3s infinite linear;
    }

    .actions-menu {
        background-color: #f9f0cf;
        border: #6a4622;
        border-radius: .5rem;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        position: absolute;
        height: 5rem;
        width: 7rem;
        opacity: .875;
        padding: 1rem;
        top: 5rem;
        left: 1rem;
        z-index: 5;

        > div {
            cursor: pointer;
            margin: .5rem;
            transition: all .5s;

            &:hover {
                color: #555;
                transform: skew(-15deg);
            }
        }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
</style>
