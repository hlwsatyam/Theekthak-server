// routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Store = require('../models/Store');

// Create product
router.post('/', async (req, res) => {
  try {
    // Check if user has a store
    const store = await Store.findOne({ owner: req.headers.currentuser });
    if (!store) {
      return res.status(400).json({ error: 'You need to create a store first' });
    }

    const productData = {
      ...req.body,
      store: store._id,
      owner: req.headers.currentuser
    };

    // Parse JSON fields
    if (req.body.attributes) productData.attributes = JSON.parse(req.body.attributes);
    if (req.body.tags) productData.tags = JSON.parse(req.body.tags);

    // Handle images array
    if (req.body.images) {
      productData.images = JSON.parse(req.body.images);
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      owner: req.headers.currentuser 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updates = { ...req.body };
    
    // Parse JSON fields if they are strings
    if (typeof updates.attributes === 'string') updates.attributes = JSON.parse(updates.attributes);
    if (typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
    if (typeof updates.images === 'string') updates.images = JSON.parse(updates.images);

    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    await product.save();
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.headers.currentuser 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get my products
router.get('/my-products', async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.headers.currentuser });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const products = await Product.find({ store: store._id });
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      owner: req.headers.currentuser 
    }).populate('store');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;