const express = require("express");
const connectDB = require("./config/db");
var cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, "./build")));
app.use(cors());

//Connect Database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));

//Define routes
app.use("/api/users", require("./routes/users"));

app.get("/test", (req, res) => {
	res.send("WELCOME!!!");
});

app.get("/*", (req, res) => {
	// console.log(path.join(__dirname, "build", "index.html"));
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
