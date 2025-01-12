const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const multer = require('multer');
const cors = require("cors");

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBZO_qPA9DzXIjk98g_viP3I0obbsyKHdQ');


// Middleware settings
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ['https://ecomfron-two.vercel.app', 'https://ecomadmin-xi.vercel.app']
}));

// Database Connection With Mongo
mongoose.connect("mongodb+srv://pratikdhamepawar:Sshs5to10%40yb@cluster0.yq2oi1i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Basic route to check API
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

app.post('/chatbot', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = req.body.message;

const result = await model.generateContent(prompt);
    
            res.json({ response: result
        });
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).send('Error processing your request');
    }
});




// Imgur Client ID
const IMGUR_CLIENT_ID = '3cc35945b2a1646';  // Replace with your actual Imgur Client ID

// Image Upload Handling with multer
const upload = multer({ storage: multer.memoryStorage() });

// Product Schema
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    }
});

// Endpoint to fetch all products
app.get('/allproducts', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products); // Send back all products
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: 0, error: "Failed to fetch products" });
    }
});

// Endpoint to remove a product by ID
app.post('/removeproduct', async (req, res) => {
    try {
        const { id } = req.body; // Get ID from request body
        const result = await Product.deleteOne({ id }); // Remove the product
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: 0, error: "Product not found" });
        }
        res.json({ success: 1, message: "Product removed successfully" });
    } catch (error) {
        console.error('Error removing product:', error);
        res.status(500).json({ success: 0, error: "Failed to remove product" });
    }
});

// Endpoint to upload image and create product
app.post('/addproduct', upload.single('product'), async (req, res) => {
    try {
        let products = await Product.find({});
        let id;

        if (products.length > 0) {
            let last_product = products[products.length - 1];
            id = last_product.id + 1;
        } else {
            id = 1;
        }

        // Check if the file is uploaded
        if (!req.file) {
            return res.status(400).json({ success: 0, error: "No file uploaded" });
        }

        // Upload the image to Imgur
        const imgurResponse = await axios({
            method: 'post',
            url: 'https://api.imgur.com/3/image',
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            },
            data: {
                image: req.file.buffer.toString('base64'),
                type: 'base64',
            },
        });

        // Create product entry in the database
        const product = new Product({
            id: id,
            name: req.body.name,
            image: imgurResponse.data.data.link,  // Use the Imgur URL
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        console.log("Product Saved:", product);

        res.json({
            success: true,
            name: req.body.name,
            image_url: imgurResponse.data.data.link,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: 0, error: "Product creation failed" });
    }
});

// User Schema for handling user registration and login
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// User Signup
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "Existing user found with same email Id" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });
    await user.save();

    const data = {
        user: {
            id: user.id
        }
    };
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token });
});

// User Login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        } else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    } else {
        res.json({ success: false, errors: "Wrong Email Id" });
    }
});

// Additional Endpoints
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
});

app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4);
    console.log("Popular in Women Fetched");
    res.send(popular_in_women);
});


// Start Server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});

module.exports = app;
