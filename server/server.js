const express = require("express");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Event = require("./models/Event");

const app = express();
const PORT = process.env.PORT;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✓ Connected to MongoDB"))
  .catch((err) => console.error("✗ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("server working");
});
app.post("/", (req, res) => {
  res.send("server workingon post");
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));

// Express Routes

// Register for an event
app.post("/api/events/:id/register", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent duplicate registrations
    const already = user.events.some((eId) => eId.toString() === eventId);
    if (!already) {
      user.events.push(eventId);
      await user.save();
    }

    return res.json({
      success: true,
      message: "Registered for event",
      events: user.events,
    });
  } catch (error) {
    console.error("✗ Error registering for event:", error);
    res
      .status(500)
      .json({ success: false, message: "Error registering for event" });
  }
});

// Get registered events for a user
app.get("/api/events/registered", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email }).populate({
      path: "events",
      select: "title date time location attendees status description",
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, events: user.events || [] });
  } catch (error) {
    console.error("✗ Error fetching registered events:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching registered events" });
  }
});

// API endpoint to signup
app.post("/api/signup", async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  // Validate passwords match
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  // Validation
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    console.log("hello");
    console.log(existingUser);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password,
      role: "student",
    });

    await newUser.save();
    console.log(`✓ Account created successfully for ${email}`);

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Account created successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("✗ Error creating user:", error);
    res.status(500).json({ success: false, message: "Error creating account" });
  }
});

// API endpoint to login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Check password
    if (user.password !== password) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    // Login successful - return user data (without password)
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({
      success: true,
      message: "Login successful!",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("✗ Error during login:", error);
    res.status(500).json({ success: false, message: "Error during login" });
  }
});

// API endpoint to get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("✗ Error fetching users:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// API endpoint to get user profile by email
app.get("/api/user/:email", async (req, res) => {
  const { email } = req.params;

  // Validate email parameter
  if (!email || email.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("✗ Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
});

// API endpoint to get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, events });
  } catch (error) {
    console.error("✗ Error fetching events:", error);
    res.status(500).json({ success: false, message: "Error fetching events" });
  }
});

// API endpoint to create a new event
app.post("/api/events", async (req, res) => {
  const { title, date, time, location, description, status, attendees } =
    req.body;

  // Validation
  if (!title || !date || !time || !location || !description) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Create new event
    const newEvent = new Event({
      title,
      date,
      time,
      location,
      attendees: attendees || 0,
      status: status || "Published",
      description,
    });

    await newEvent.save();
    console.log("✓ Event created successfully");

    res.json({
      success: true,
      message: "Event created successfully!",
      event: newEvent,
    });
  } catch (error) {
    console.error("✗ Error creating event:", error);
    res.status(500).json({ success: false, message: "Error creating event" });
  }
});

// API endpoint to delete an event (admin only)
app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Remove deleted event from any user registrations
    await User.updateMany({ events: id }, { $pull: { events: id } });

    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("✗ Error deleting event:", error);
    res.status(500).json({ success: false, message: "Error deleting event" });
  }
});

// Start server
function startServer() {
  app.listen(PORT, () => {
    console.log(`\n✓ Express server running at http://localhost:${PORT}`);
    console.log(`✓ Open http://localhost:${PORT} in your browser\n`);
  });
}

// Default: start server
startServer();

module.exports = app;
