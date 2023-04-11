const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/User");
const API_KEY = process.env.API_KEY;
// const API_KEY = config.get("API_KEY");

// @route   GET api/users/getuser
// @decs    Get logged in user
// @access  Public
// router.get("/getuser", async (req, res, next) => {
// 	try {
// 		const user = await User.findOne({ email: req.user.email }).select(
// 			"-password"
// 		);

// 		res.json(user);
// 	} catch (err) {
// 		console.log(err.message);
// 		res.status(500).send("Server error");
// 	}
// });

// @route   GET api/users/getImage
// @decs    Get image of the day
// @access  Public
router.get("/getImage", async (req, res) => {
	try {
		const response = await fetch(
			`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
		);
		const jsonData = await response.json();
		res.json(jsonData);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error");
	}
});

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
	if (req.body.googleAccessToken) {
		//Google Oauth
		const { googleAccessToken } = req.body;

		try {
			const resp = await axios.get(
				"https://www.googleapis.com/oauth2/v3/userinfo",
				{
					headers: {
						Authorization: `Bearer ${googleAccessToken}`,
					},
				}
			);

			const name = resp.data.name;
			const email = resp.data.email;
			console.log("BACKEND RESP", name, email);

			let user;
			user = await User.findOne({ email });

			if (!user) {
				user = await User.create({
					email,
					name,
				});
			}
			// return res.status(400).json({ message: "User already exist!" });

			const token = jwt.sign(
				{
					email: user.email,
					id: user._id,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);
			console.log("BACKEND GOOG TOKEN", token);
			console.log("BACKEND GOOG USER", user);

			res.status(200).json({ user, token });
		} catch (err) {
			res.status(400).json({ message: "Invalid access token!" });
		}
	} else {
		// normal form signup
		const { email, password, name } = req.body;

		try {
			if (email === "" || password === "" || name === "" || password.length < 6)
				return res.status(400).json({ message: "Invalid field!" });

			const existingUser = await User.findOne({ email });

			if (existingUser)
				return res.status(400).json({ message: "User already exist!" });

			user = new User({
				name,
				email,
				password,
			});

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();

			const token = jwt.sign(
				{
					email: user.email,
					id: user._id,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			res.status(200).json({ user, token });
		} catch (err) {
			console.log(err);
			res.status(500).json({ message: "Something went wrong!" });
		}
	}
});

// @route   POST api/users/login
// @decs    Login user & get token
// @access  Public
router.post("/login", async (req, res) => {
	if (req.body.googleAccessToken) {
		// gogole-auth
		const { googleAccessToken } = req.body;

		try {
			const res = await axios.get(
				"https://www.googleapis.com/oauth2/v3/userinfo",
				{
					headers: {
						Authorization: `Bearer ${googleAccessToken}`,
					},
				}
			);

			const email = response.data.email;

			const existingUser = await User.findOne({ email });

			if (!existingUser)
				return res.status(404).json({ message: "User don't exist!" });

			const token = jwt.sign(
				{
					email: existingUser.email,
					id: existingUser._id,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			res.status(200).json({ result: existingUser, token });
		} catch (err) {
			res.status(400).json({ message: "Invalid access token!" });
		}
	} else {
		// normal-auth
		const { email, password } = req.body;
		if (email === "" || password === "")
			return res.status(400).json({ message: "Invalid field!" });
		try {
			const existingUser = await User.findOne({ email });

			if (!existingUser)
				return res.status(404).json({ message: "User don't exist!" });

			const isMatch = await bcrypt.compare(password, existingUser.password);

			if (!isMatch) {
				return res.status(400).json({ msg: "Invalid Credentials" });
			}

			const token = jwt.sign(
				{
					email: existingUser.email,
					id: existingUser._id,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			res.status(200).json({ result: existingUser, token });
		} catch (err) {
			res.status(500).json({ message: "Something went wrong!" });
		}
	}
});

module.exports = router;
