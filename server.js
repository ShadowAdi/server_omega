const { ConnectDB } = require("./db/db");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { router } = require("./routes/route");

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("register", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} registered and joined room.`);
    });

    socket.on("sendMessage", (message) => {
        io.to(message.receiver).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

ConnectDB();

// Listen on the same PORT for both HTTP and WebSocket
httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
