const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { EventEmitter } = require("node:events");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const server = require("http").createServer(app);

const eventEmitter = new EventEmitter();

app.post("/offer", function (req, res) {
  console.log("body", req.body);

  eventEmitter.emit("offered", req.body);

  res.send(req.body);
});

app.post("/answer", function (req, res) {
  console.log("body", req.body);

  eventEmitter.emit("answer", req.body);

  res.send(req.body);
});

app.get("/", function (req, res) {
  res.send("backend");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  eventEmitter.on("offered", (data) => {
    socket.emit("offered", data);
  });

  eventEmitter.on("answer", (data) => {
    socket.emit("answer", data);
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

server.listen(4444, () => {
  console.log("running");
});
