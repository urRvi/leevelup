const model = require('../models/model');
const User = model.User; // Assuming User is exported from model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // Added for ObjectId conversion
const cloudinary = require('../config/cloudinaryConfig'); // Import Cloudinary config
const DatauriParser = require('datauri/parser'); // For converting buffer to data URI
const path = require('path'); // For getting file extension

require('dotenv').config({ path: './config.env' });


// POST: http://localhost:8080/api/categories
async function create_Categories(req, res) {
    try {
        const newCategory = new model.Categories({
            type: "Savings",
            color: "#36A2EB"
        });

        const savedCategory = await newCategory.save();
        return res.json(savedCategory);

    } catch (err) {
        return res.status(400).json({ message: `Error while creating categories: ${err.message}` });
    }
}
async function get_Categories(req, res) {
    try {
        let data = await model.Categories.find({})
        let filter= await data.map(v=>Object.assign({}, {type:v.type, color:v.color}));
        return res.json(filter);

    } catch (err) {
        return res.status(400).json({ message: `Error while creating categories: ${err.message}` });
    }
}
async function create_Transaction(req,res){
    try {
        if(!req.body) return res.status(400).json('Post HTTP data not provided');
        let {name, type, amount}=req.body;

        const create=await new model.Transaction({
            name,
            type,
            amount,
            date:new Date(),
            userId: req.user.id // Associate with logged-in user
        });
        const savedTransaction = await create.save();
    return res.json(savedTransaction);
    } catch (err) {
        return res.status(400).json({ message: `Error while creating Transaction: ${err.message}` });
    }
}
async function get_Transaction(req, res) {
    try {
        let data = await model.Transaction.find({ userId: req.user.id }); // Filter by user
        return res.json(data);

    } catch (err) {
        return res.status(400).json({ message: `Error while getting transactions: ${err.message}` });
    }
}
async function delete_Transaction(req, res) {
    try {
        // Assuming the client sends the ID of the transaction to delete in req.body.id
        // This is a common pattern, but it might be req.params.id depending on route setup.
        // For this example, let's assume req.body.id is provided.
        const transactionId = req.body.id; 
        if (!transactionId) {
            return res.status(400).json({ message: "Transaction ID not provided in request body" });
        }
        
        const deleted = await model.Transaction.deleteOne({ _id: transactionId, userId: req.user.id });
        
        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: "No matching transaction found for this user, or transaction does not exist." });
        }
        return res.json({ message: "Transaction deleted successfully!" });
    } catch (err) {
        // Catch CastError specifically for invalid ID format
        if (err.name === 'CastError') {
            return res.status(400).json({ message: `Invalid transaction ID format: ${err.message}` });
        }
        return res.status(500).json({ message: "Error while deleting transaction record", error: err.message });
    }
}
async function get_Labels(req, res) {
    try {
        const result = await model.Transaction.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user.id) } // Filter by user
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $unwind: "$categories_info"
            }
        ]);
        const data = result.map(v => ({
            _id: v._id,
            name: v.name,
            type: v.type,
            amount: v.amount,
            color: v.categories_info.color
        }));
        return res.json(data);
    } catch (error) {
        return res.status(400).json({ message: "Lookup Collection Error", error: error.message });
    }
}

module.exports = {
    create_Categories,
    get_Categories,
    create_Transaction,
    get_Transaction,
    delete_Transaction,
    get_Labels,
    create_FoodItem,
    get_FoodItems,
    create_CalorieEntry,
    get_CalorieEntries,
    delete_CalorieEntry,
    signup,
    login,
    logout,
    upload_Image
};

// Image Upload Controller
async function upload_Image(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Convert buffer to data URI
        const parser = new DatauriParser();
        const dataUri = parser.format(path.extname(req.file.originalname).toString(), req.file.buffer);
        
        const result = await cloudinary.uploader.upload(dataUri.content, {
            folder: "levelup_tracker_meals", // Optional: organize uploads in a specific folder
            // public_id: `meal_${req.user.id}_${Date.now()}`, // Optional: custom public ID
        });

        res.json({ imageUrl: result.secure_url, publicId: result.public_id });

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        res.status(500).json({ message: 'Error uploading image to Cloudinary', error: error.message });
    }
}

// Auth Controller Functions
// POST: /api/auth/signup
async function signup(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please provide username, email, and password." });
        }

        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email or username." });
        }

        user = new User({ username, email, password });
        await user.save();

        const payload = { userId: user.id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, userId: user.id, username: user.username, message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error during signup", error: error.message });
    }
}

// POST: /api/auth/login
async function login(req, res) {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: "Please provide email/username and password." });
        }

        const user = await User.findOne({
            $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }]
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const payload = { userId: user.id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, userId: user.id, username: user.username, message: "Logged in successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error during login", error: error.message });
    }
}

// POST: /api/auth/logout
async function logout(req, res) {
    // For JWT, logout is typically handled client-side by clearing the token.
    // If you were using sessions, you would destroy the session here.
    // For now, just send a success message.
    res.json({ message: "Logged out successfully" });
}

// POST: http://localhost:8080/api/fooditems
async function create_FoodItem(req, res) {
    try {
        if (!req.body) return res.status(400).json('Post HTTP data not provided');
        const { name, calories, protein, carbohydrates, fat } = req.body;

        const newFoodItem = new model.FoodItem({
            name,
            calories,
            protein,
            carbohydrates,
            fat
        });

        const savedFoodItem = await newFoodItem.save();
        return res.json(savedFoodItem);

    } catch (err) {
        return res.status(400).json({ message: `Error while creating food item: ${err.message}` });
    }
}

// GET: http://localhost:8080/api/fooditems
async function get_FoodItems(req, res) {
    try {
        const data = await model.FoodItem.find({});
        return res.json(data);
    } catch (err) {
        return res.status(400).json({ message: `Error while getting food items: ${err.message}` });
    }
}

// POST: http://localhost:8080/api/calorieentries
async function create_CalorieEntry(req, res) {
    try {
        if (!req.body) return res.status(400).json('Post HTTP data not provided');
        // imageUrl will now be part of the request body, sent after uploading to /api/upload-image
        const { foodItemId, quantity, imageUrl } = req.body;

        // Basic validation for foodItemId
        if (!foodItemId) {
            return res.status(400).json({ message: "foodItemId is required" });
        }
        // Check if the food item exists
        const foodItem = await model.FoodItem.findById(foodItemId);
        if (!foodItem) {
            return res.status(404).json({ message: "FoodItem not found" });
        }

        const newCalorieEntry = new model.CalorieEntry({
            foodItemId,
            quantity,
            date: new Date(),
            userId: req.user.id, // Associate with logged-in user
            imageUrl: imageUrl || null // Save the image URL if provided
        });

        const savedCalorieEntry = await newCalorieEntry.save();
        return res.json(savedCalorieEntry);

    } catch (err) {
        // Catch CastError specifically for invalid foodItemId format
        if (err.name === 'CastError') {
            return res.status(400).json({ message: `Invalid foodItemId format: ${err.message}` });
        }
        return res.status(400).json({ message: `Error while creating calorie entry: ${err.message}` });
    }
}

// GET: http://localhost:8080/api/calorieentries
async function get_CalorieEntries(req, res) {
    try {
        const data = await model.CalorieEntry.find({ userId: req.user.id }).populate('foodItemId'); // Filter by user
        return res.json(data);
    } catch (err) {
        return res.status(400).json({ message: `Error while getting calorie entries: ${err.message}` });
    }
}

// DELETE: http://localhost:8080/api/calorieentries/:id
async function delete_CalorieEntry(req, res) {
    try {
        const entryId = req.params.id;
        if (!entryId) {
            return res.status(400).json({ message: "Calorie entry ID not provided" });
        }

        const deleted = await model.CalorieEntry.deleteOne({ _id: entryId, userId: req.user.id });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: "No matching calorie entry found for this user, or entry does not exist." });
        }
        return res.json({ message: "Calorie entry deleted successfully!" });

    } catch (err) {
        // Catch CastError specifically for invalid ID format
        if (err.name === 'CastError') {
            return res.status(400).json({ message: `Invalid calorie entry ID format: ${err.message}` });
        }
        return res.status(500).json({ message: "Error while deleting calorie entry", error: err.message });
    }
}