require('dotenv').config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require("uuid");
const path = require('path');
const authRoutes = require('./routes/auth');
const { BASE_URL, SERVER_IP, SERVER_PORT, NETWORK_INTERFACES } = require('./config/constants');
const os = require('os');
const config = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Server configuration
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // This is crucial - binds to all network interfaces

// Set the path to your XAMPP htdocs directory
const API_PATH = path.join('C:', 'xampp', 'htdocs', 'PetFurMe-Application', 'api');

// Create connection pool with more detailed error handling
const pool = mysql.createPool({
	...config,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0
}).on('error', (err) => {
	console.error('Database pool error:', err);
});

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
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	console.log("Request Body:", req.body);
	next();
});

// Add request logging middleware
app.use((req, res, next) => {
	console.log("=================================");
	console.log("Incoming Request:");
	console.log(`Time: ${new Date().toISOString()}`);
	console.log(`Method: ${req.method}`);
	console.log(`URL: ${req.url}`);
	console.log("Headers:", req.headers);
	console.log("Body:", req.body);
	console.log("=================================");
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
		const [pets] = await pool.query(
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

// Test database connection with more detailed logging
async function testConnection() {
	try {
		console.log('Attempting database connection with config:', {
			host: config.host,
			user: config.user,
			database: config.database,
			port: config.port
		});

		const connection = await pool.getConnection();
		console.log('Successfully acquired connection');

		await connection.query('SELECT 1');
		console.log('Successfully executed test query');

		connection.release();
		console.log('Successfully released connection');
		return true;
	} catch (error) {
		console.error('Database connection error:', {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sqlState: error.sqlState,
			sqlMessage: error.sqlMessage
		});
		return false;
	}
}

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		database: pool ? "connected" : "disconnected",
	});
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
		const [existingUser] = await pool.query(
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
		const [result] = await pool.query(
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

		const [users] = await pool.query(
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
		pool.query(query, [email], async (err, results) => {
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

app.use('/api', authRoutes);

// Add this near the top of your server.js, after your middleware setup
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path}`);
	next();
});

// Add error handling middleware at the bottom of your server.js
app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(500).json({
		success: false,
		error: 'Internal server error'
	});
});

// Add this test endpoint
app.get('/api/cors-test', (req, res) => {
	res.json({
		message: 'CORS is working',
		origin: req.headers.origin,
		headers: req.headers
	});
});

// Add this near the top of your routes
app.use((req, res, next) => {
	console.log('Incoming request:', {
		method: req.method,
		path: req.path,
		headers: req.headers,
		body: req.body
	});
	next();
});

// Add a test endpoint
app.get('/api/test-cors', (req, res) => {
	res.json({ message: 'CORS is working' });
});

// Add this test route
app.get('/test', (req, res) => {
	res.json({ message: 'Test route working' });
});

// Add this near the top of your routes
app.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		ip: req.ip,
		serverAddress: req.socket.localAddress
	});
});

// Get all network interfaces
const getNetworkAddresses = () => {
	const interfaces = os.networkInterfaces();
	const addresses = [];
	
	for (const iface of Object.values(interfaces)) {
		for (const addr of iface) {
			if (addr.family === 'IPv4' && !addr.internal) {
				addresses.push(addr.address);
			}
		}
	}
	return addresses;
};

// Start server function
async function startServer() {
	try {
		// Test database connection before starting server
		const isConnected = await testConnection();
		if (!isConnected) {
			throw new Error('Database connection failed');
		}

		// Your existing middleware and route setup
		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		// Add request logging middleware
		app.use((req, res, next) => {
			console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
			next();
		});

		// Your routes here...

		// Start the server
		app.listen(PORT, HOST, () => {
			const addresses = getNetworkAddresses();
			console.log("=================================");
			console.log(`Server running on port ${PORT}`);
			console.log("\nAvailable on:");
			console.log(`- Local: http://localhost:${PORT}`);
			addresses.forEach(addr => {
				console.log(`- Network: http://${addr}:${PORT}`);
			});
			console.log("\nDatabase Status: Connected");
			console.log("=================================");
		});
	} catch (error) {
		console.error('Server startup failed:', error);
		process.exit(1);
	}
}

// Handle process termination
process.on('SIGINT', async () => {
	try {
		await pool.end();
		console.log('Database pool closed');
		process.exit(0);
	} catch (error) {
		console.error('Error closing database pool:', error);
		process.exit(1);
	}
});

// Start the server
startServer();

// Add this after your routes
app.use(errorHandler);
