const express = require("express");
const http = require("http");

const PORT = 5000;

const app = express();
const server = http.createServer(app);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const io = require("socket.io")(server);

let connectedPeers = [];

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("group-chat-message", (data) => {
    io.emit("group-chat-message", data);
  });
  socket.on("register-new-user", (userData) => {
    const { username, roomId } = userData;

    const newPeer = {
      username,
      socketId: socket.id,
      roomId,
    };

    // join socket io room
    socket.join(roomId);

    connectedPeers = [...connectedPeers, newPeer];
    broudcastConnectedPeers();
  });

  socket.on("direct-message", (data) => {
    const { receiverSocketId } = data;
    const connectedPeer = connectedPeers.find(
      (peer) => peer.socketId === receiverSocketId
    );
    if (connectedPeer) {
      const authorData = {
        ...data,
        isAuthor: true,
      };

      socket.emit("direct-message", authorData);
      io.to(receiverSocketId).emit("direct-message", data);
    }
  });

  socket.on("room-message", (data) => {
    const { roomId } = data;

    io.to(roomId).emit("room-message", data);
  });

  socket.on("disconnect", () => {
    connectedPeers = connectedPeers.filter(
      (peer) => peer.socketId != socket.id
    );
    broudcastConnectedPeers();

    const data = {
      socketIdOfDisconnectedPeer: socket.id,
    };

    io.emit("peer-disconnected", data);
  });
});

const broudcastConnectedPeers = () => {
  const data = {
    connectedPeers,
  };
  io.emit("active-peers", data);
};

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
