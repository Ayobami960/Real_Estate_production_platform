import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import {Server} from "socket.io";

import http from "http";
import connectDB from "./config/db.js";
import router from "./routes/index.js";

const app = express();
const PORT = 5000;

// DB
await connectDB();

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", router)

app.get("/", (req, res)=>{
  res.send("API WORKING");
})

// JSON parse error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(err);
});

const server = http.createServer(app);

//socket.io setup
const io = new Server(server,{
  cors: {
    origin: "*", 
    method: ["GET", "POST"],
    credentials: true 
  }
})

io.on("connection", (socket) => {
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.chatId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
  });
})

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

})