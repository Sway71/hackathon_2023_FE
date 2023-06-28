import { writable } from 'svelte/store';

const messageStore = writable([]);

const sendMessage = (message: string) => {
	console.log("send message from store")
}

export default {
	subscribe: messageStore.subscribe,
	sendMessage
}