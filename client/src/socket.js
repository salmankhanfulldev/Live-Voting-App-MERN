// import { io } from "socket.io-client";

// const socket = io("/", {
//   path: "/socket.io",
//   autoConnect: true,
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
// });

// export default socket;

// import { io } from "socket.io-client";

// const socket = io("https://livevotingmern-d4vq4k7n.b4a.run", {
//   path: "/socket.io",
//   transports: ["websocket", "polling"],
//   autoConnect: true,
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
// });

// export default socket;

import { io } from "socket.io-client";

const socket = io("https://livevotingmern-d4vq4k7n.b4a.run", {
  transports: ["polling", "websocket"],
});

export default socket;