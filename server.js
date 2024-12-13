const { ConnectDB } = require("./db/db");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { router } = require("./routes/route");

const app = express();
const httpServer = http.createServer(app);

const SOCKET_PORT = process.env.SOCKET_PORT || 9000;
const APP_PORT = process.env.PORT || 3000;



const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
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

httpServer.listen(SOCKET_PORT, () => {
    console.log(`Chat started on port ${SOCKET_PORT}`);
});

app.listen(APP_PORT, () => {
    console.log(`App started on port ${APP_PORT}`);
});
