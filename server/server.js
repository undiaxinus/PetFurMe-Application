const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
	console.log(`${req.method} request to ${req.url}`);
	next();
});

// MySQL Connection
const db = mysql.createConnection({
	host: "10.0.2.2",
	user: "root",
	password: "",
	database: "pet-management",
});

db.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL:", err.message);
		return;
	}
	console.log("Connected to MySQL Database");
});

// Save appointment endpoint
app.post("/saveAppointment", (req, res) => {
	const { owner_name, reason_for_visit, appointment_date, appointment_time } =
		req.body;

	const query = `
    INSERT INTO appointment (owner_name, reason_for_visit, appointment_date, appointment_time) 
    VALUES (?, ?, ?, ?)
  `;
	db.query(
		query,
		[owner_name, reason_for_visit, appointment_date, appointment_time],
		(err, result) => {
			if (err) {
				console.error("E rror saving appointment:", err.message);
				return res.status(500).json({ error: "Failed to save appointment" });
			}
			res.status(200).json({ message: "Appointment saved successfully" });
		}
	);
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
