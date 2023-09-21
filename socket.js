const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const session = require("express-session");
const sharedSession = require("express-socket.io-session");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 9000;
app.use(cors());
app.use(bodyParser.json());


app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
  next(); 
})
const allowedOrigins = [
  "http://192.168.100.61:3000",
  "http://192.168.100.78:3000",
  "http://192.168.0.125",
  "https://unitysocketbuild.onrender.com",
  "http://192.168.1.104:3000",
  "http://192.168.100.61:3000",
  "http://192.168.1.8",
  "http://localhost:3000",
  "http://172.20.10.3:3000",
  "http://172.20.10.1",
  "172.20.10.1",
  "http://192.168.1.7:3000",
  "http://192.168.1.14",
  "http://localhost:9000",
  "http://18.191.250.59:9000"
];
let latexValue = "";


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
    latexValue = convertedValue; // Update the convertedValue

    // Check if the user is authenticated
    // if (socket.session.authenticated) {
    socket.broadcast.emit("convertedValue", convertedValue);
    console.log("................CONVERTEDVALUE", convertedValue);
    //  sendWebhook(convertedValue);
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

app.get("/fetchlatexValue", (req, res) => {
  res.json({ convertedValue });
});



app.post("/sendConvertedValue", (req, res) => {
  try {
    const { convertedValue: newValue } = req.body;
    // Log the received value for debugging
    console.log("Received convertedValue:", newValue);

    // Update the convertedValue variable
    convertedValue = newValue;

    // Process the `convertedValue` as needed here

    // Respond with a success message or any data you want
    res.status(200).json({ message: "Received convertedValue successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/init-session", (req, res) => {
  // Generate a unique session identifier (you can use a library like uuid)
  const sessionId = generateSessionId();

  // Store the session identifier in the user's session
  req.session.sessionId = sessionId;

  // Save the session
  req.session.save((err) => {
    if (err) {
      console.error("Error saving session:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ sessionId });
    }
  });
});


app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "clientSocket", "build", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server initialized. Listening on PORT ${PORT}`);
});
