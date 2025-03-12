require('dotenv').config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require("uuid");
const path = require('path');
const authRoutes = require('./routes/auth');
const { BASE_URL, SERVER_IP, SERVER_PORT } = require('./config/constants');
const http = require('http');
	
// Server configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";  // This allows connections from all network interfaces

// Set the path to your XAMPP htdocs directory
const API_PATH = path.join('C:', 'xampp', 'htdocs', 'PetFurMe-Application', 'api');

// Database configuration
const dbConfig = {
	host: 'localhost',
	user: 'root',  // default XAMPP username
	password: '',  // default XAMPP password is empty
	database: 'pet-management',
	port: 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
};

// Create database pool
const db = mysql.createPool(dbConfig);

const app = express();

// CORS configuration - this must come BEFORE other middleware
app.use(cors({
	origin: '*', // Allow all origins during development
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
	credentials: true
}));

// Remove any other CORS-related middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] Request:`, {
		method: req.method,
		url: req.url,
		headers: req.headers,
		ip: req.ip
	});
	next();
});

// Add this test endpoint
app.get('/api/test', (req, res) => {
	res.json({ status: 'ok', message: 'API is working' });
});

// Add this new endpoint for getting user pets with proper error handling
app.get("/api/pets/get_user_pets", async (req, res) => {
	try {
		const user_id = req.query.user_id;
		
		if (!user_id) {
			return res.status(400).json({
				success: false,
				message: 'user_id parameter is missing'
			});
		}

		console.log("API Path:", API_PATH);
		console.log("Full endpoint path:", path.join(API_PATH, 'pets', 'get_user_pets.php'));
		console.log("Attempting to fetch pets for user_id:", user_id);

		// Execute the query with proper error handling
		const [pets] = await db.query(
			"SELECT id, name, photo FROM pets WHERE user_id = ?",
			[user_id]
		);

		console.log("Query successful, found pets:", pets);

		res.json({
			success: true,
			data: {
				pets: pets || []
			}
		});

	} catch (error) {
		console.error("Error in get_user_pets endpoint:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch pets",
			sqlMessage: error.sqlMessage
		});
	}
});

// Move error handling middleware to after all route definitions
app.use((err, req, res, next) => {
	console.error("Server Error:", err);
	res.status(500).json({
		success: false,
		error: "Internal server error",
		details: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
});

// Test database connection
const testDatabaseConnection = async () => {
	try {
		const connection = await db.getConnection();
		console.log('Database connection successful');
		connection.release();
		return true;
	} catch (error) {
		console.error('Database connection error:', error);
		return false;
	}
};

// Health check endpoint
app.get('/health', async (req, res) => {
	try {
		// Test database connection
		const dbConnected = await testDatabaseConnection();
		
		res.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			server: {
				ip: SERVER_IP,
				port: PORT,
				uptime: process.uptime()
			},
			database: {
				connected: dbConnected,
				host: dbConfig.host
			},
			client: {
				ip: req.ip,
				headers: req.headers
			}
		});
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: error.message,
			timestamp: new Date().toISOString()
		});
	}
});

// Also add this before the health endpoint
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	next();
});

// Add this after your health endpoint
app.get('/debug', async (req, res) => {
	try {
		// Test database connection
		const [result] = await db.query('SELECT 1');
		
		res.json({
			status: 'ok',
			database: 'connected',
			timestamp: new Date().toISOString(),
			server: {
				ip: SERVER_IP,
				port: PORT
			},
			headers: req.headers,
			clientIP: req.ip
		});
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: error.message,
			timestamp: new Date().toISOString()
		});
	}
});

// Registration endpoint with password hashing
app.post("/api/register", async (req, res) => {
	const { name, email, password, username, role } = req.body;

	try {
		console.log("Received registration request:", {
			name,
			email,
			username,
			role,
		});

		// Check if email already exists
		const [existingUser] = await db.query(
			"SELECT * FROM users WHERE email = ?",
			[email]
		);

		if (existingUser.length > 0) {
			console.log("Email already exists:", email);
			return res.status(400).json({
				success: false,
				error: "Email already registered",
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);
		const uuid = uuidv4();

		// Insert user
		const [result] = await db.query(
			`INSERT INTO users (uuid, username, name, email, password, role, created_at, updated_at) 
			VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
			[
				uuid,
				username,
				name,
				email,
				hashedPassword,
				role || "pet_owner",
			]
		);

		console.log("User registered successfully:", {
			id: result.insertId,
			email,
		});

		res.json({
			success: true,
			message: "Registration successful",
			user_id: result.insertId
		});
	} catch (error) {
		console.error("Registration error:", {
			message: error.message,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
		});
		res.status(500).json({
			success: false,
			error: error.sqlMessage || "Registration failed. Please try again.",
		});
	}
});

// Login endpoint with bcrypt comparison
app.post("/api/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		console.log('Login attempt for:', username);

		const [users] = await db.query(
			"SELECT * FROM users WHERE email = ? OR username = ?",
			[username, username]
		);

		if (users.length === 0) {
			return res.status(401).json({
				success: false,
				error: "User not found"
			});
		}

		const user = users[0];
		const match = await bcrypt.compare(password, user.password);

		if (!match) {
			return res.status(401).json({
				success: false,
				error: "Invalid password"
			});
		}

	res.json({
		success: true,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role
		}
	});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			error: "Login failed. Please try again."
		});
	}
});

// Add this test endpoint to your server.js
app.post("/api/test-password", async (req, res) => {
	try {
		const { email, password } = req.body;

		// Get user from database
		const query = "SELECT * FROM users WHERE email = ?";
		db.query(query, [email], async (err, results) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (results.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			const user = results[0];

			// Compare password
			const match = await bcrypt.compare(password, user.password);

			res.json({
				passwordMatches: match,
				hashedPassword: user.password,
				providedPassword: password,
			});
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Add after line 71 in server.js
app.use((req, res, next) => {
	console.log("Request received:", {
		method: req.method,
		url: req.url,
		headers: req.headers,
		body: req.body,
		ip: req.ip,
	});
	next();
});

// Add pet endpoint
// app.post("/api/pets/create", async (req, res) => { ... });

app.use('/api', authRoutes(db));

// Add this right after your app declaration
app.use((req, res, next) => {
	console.log('Incoming request:', {
		method: req.method,
		url: req.url,
		headers: req.headers,
		body: req.body,
		ip: req.ip,
		timestamp: new Date().toISOString()
	});
	next();
});

// Add this near the top of your middleware stack
app.use((req, res, next) => {
	const startTime = Date.now();
	
	// Log request
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	console.log('Headers:', req.headers);
	console.log('Body:', req.body);
	
	// Log response
	res.on('finish', () => {
		const duration = Date.now() - startTime;
		console.log(`[${new Date().toISOString()}] Response sent:`, {
			method: req.method,
			url: req.url,
			status: res.statusCode,
			duration: `${duration}ms`
		});
	});
	
	next();
});

// Create HTTP server separately
const server = http.createServer(app);

// Add proper error handling and cleanup
server.on('error', (error) => {
	console.error('Server error:', error);
	if (error.code === 'EADDRINUSE') {
		console.log('Address in use, retrying...');
		setTimeout(() => {
			server.close();
			server.listen(PORT, HOST);
		}, 1000);
	}
});

// Update the startServer function
const startServer = async () => {
	try {
		// Test database connection first
		const isConnected = await testDatabaseConnection();
		if (!isConnected) {
			throw new Error("Database connection failed");
		}

		// Start the server
		server.listen(PORT, HOST, async () => {
			console.log("=================================");
			console.log(`Server running on:`);
			console.log(`- Local: http://localhost:${PORT}`);
			console.log(`- Network: http://${SERVER_IP}:${PORT}`);
			console.log(`- Android: http://10.0.2.2:${PORT}`);
			console.log("Database Status: Connected");
			console.log("=================================");
			await testDatabaseConnection();
		});

		// Handle graceful shutdown
		process.on('SIGTERM', () => {
			console.log('SIGTERM received. Closing server...');
			server.close(() => {
				console.log('Server closed');
				process.exit(0);
			});
		});
	} catch (error) {
		console.error("Server startup failed:", error);
		process.exit(1);
	}
};

startServer();
