import { Socket } from 'phoenix';

export const initChat = (room: string) => {
  let socket = new Socket("ws://localhost:4000/socket", {params: {token: window.userToken}})
  socket.connect();
  const channel = socket.channel(`chat:${room}`, {client: 'browser'});
  channel.join()
    .receive('ok', () => {
        console.log("in channel");
    })
    .receive('error', (m) => {
      console.log(`error: ${m}`);
    })
  
  channel.on('shout', (payload) => {console.log('message!', payload)})

  return channel;
}