const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const session = require("express-session");
const sharedSession = require("express-socket.io-session");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 9000;
const allowedOrigins = [
  "http://192.168.100.61:3000",
  "http://192.168.100.78:3000",
  "http://192.168.0.125",
  "https://unitysocketbuild.onrender.com",
  "http://192.168.1.104:3000",
  "http://192.168.100.61:3000",
  "http://192.168.1.8",
  "http://localhost:3000",
  "172.20.10.1",
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);



// Set up session middleware
const sessionMiddleware = session({
  secret: "123",
  resave: false,
  saveUninitialized: true,
});
app.use(sessionMiddleware);

// Share session between Express and Socket.IO
io.use(
  sharedSession(sessionMiddleware, {
    autoSave: true,
  })
);

app.use(express.static(path.resolve(__dirname, "clientSocket", "build")));

// Function to send the converted value as a webhook to a specific URL
function sendWebhook(convertedValue) {
  console.log(
    "............//the converted value from the client....",
    convertedValue
  );
  // const webhookURL = "https://webhookforunity.onrender.com/webhook";
   const webhookURL = "http://localhost:5000/webhook";
  axios
    .post(webhookURL, { convertedValue })
    .then((response) => {
      const generations = response.data;
      console.log("Webhook sent successfully", generations);
    })
    .catch((error) => {
      console.error("Error sending webhook:", error.message);
    });
}

// Generate a unique two-digit code for authentication
const generateCode = () => {
  const min = 10; // Minimum two-digit number
  const max = 99; // Maximum two-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

io.on("connection", (socket) => {
  console.log("A user connected");

  // Store the session object in the socket for easy access
  socket.session = socket.handshake.session;

  // Generate and send the authentication code
  // const authenticationCode = generateCode();
  // socket.emit("authenticationCode", authenticationCode);

  // socket.on("authenticate", (enteredCode) => {
  //   // Check if the entered code matches the authentication code
  //   if (enteredCode === authenticationCode.toString()) {
  //     socket.emit("authenticated");
  //     socket.session.authenticated = true; // Store authentication status in session
  //     socket.session.save(); // Save the session
  //   } else {
  //     socket.emit("invalidCode");
  //   }
  // });

  // socket.on("drawing", (dataURL) => {
  //   socket.broadcast.emit("drawing", dataURL);
  // });

  socket.on("convertedValue", (convertedValue) => {
    // Check if the user is authenticated
    // if (socket.session.authenticated) {
    socket.broadcast.emit("convertedValue", convertedValue);
    console.log("................CONVERTEDVALUE", convertedValue);
     //sendWebhook(convertedValue);
    // } else {
    // socket.emit('unauthorized');
    // }
  });

  socket.on("generations", (generations) => {
    socket.emit("newGeneration", generations);
  });

  socket.on("clearScreen", () => {
    socket.broadcast.emit("clearScreen");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/", (req, res) => {
  console.log("Get request to Homepage");
  res.send("Hi, sent by server...");
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "clientSocket", "build", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server initialized. Listening on PORT ${PORT}`);
});
