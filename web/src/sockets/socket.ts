import useMessagesStore from "../store";

const URL = "localhost:8080";

const conn = new WebSocket("ws://" + URL + "/ws");

conn.onclose = function (evt) {
  useMessagesStore.getState().receiveMessage({
    timestamp: new Date(),
    author: "Server",
    text: "Connection closed.", 
  })
};

conn.onmessage = function (evt) {
  const messages = evt.data.split('\n');
  for (let i = 0; i < messages.length; i++) {
    const [timestamp, author, text] = messages[i].split(':')
    useMessagesStore.getState().receiveMessage({
      timestamp: new Date(timestamp),
      author,
      text, 
    });
  }
};

export function sendMessage(username: string, message: string) {
  conn.send(Date.now() + ":" + username + ":" + message);
}