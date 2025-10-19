const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const User = require('../models/User');
const storeController = require('../controllers/storeController');
 
 
 

 
// Create store (one store per user)
router.post('/',  async (req, res) => {
  try {
 
 
    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.headers.currentuser });
    if (existingStore) {
      return res.status(400).json({ error: 'You can only create one store' });
    }
 
    const storeData = {
      ...req.body,
      owner: req.headers.currentuser
    };

    // Parse JSON fields
    if (req.body.contact) storeData.contact = JSON.parse(req.body.contact);
    if (req.body.location) storeData.location = JSON.parse(req.body.location);
    if (req.body.categories) storeData.categories = JSON.parse(req.body.categories);
    if (req.body.openingHours) storeData.openingHours = JSON.parse(req.body.openingHours);
    if (req.body.socialMedia) storeData.socialMedia = JSON.parse(req.body.socialMedia);
    if (req.body.taxInfo) storeData.taxInfo = JSON.parse(req.body.taxInfo);

    // Handle file uploads
     





if (storeData.location?.coordinates?.latitude && storeData.location?.coordinates?.longitude) {
      const lat = parseFloat(storeData.location.coordinates.latitude);
      const lng = parseFloat(storeData.location.coordinates.longitude);

      storeData.geo = {
        type: "Point",
        coordinates: [lng, lat] // Always [longitude, latitude]
      };
    } else {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }






      if (req.body.logo) {
        storeData.logo = req.body.logo
      }
      if (req.body.banner) {
        storeData.banner = req.body.banner
      }
 

    const store = new Store(storeData);
    await store.save();

    // Update user's store reference
    await User.findByIdAndUpdate(req.headers.currentuser, { store: store._id });

    res.status(201).json(store);
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message });
  }
});

 






router.get('/cities', storeController.getCities);
router.get('/search', storeController.getStoreBySearch);


router.get('/', storeController.getStores);



router.get('/categories', storeController.getCategories);



router.get('/nearby', storeController.getNearbyStores);




router.put('/:id', async (req, res) => {
  try {
    const store = await Store.findOne({ 
      _id: req.params.id, 
      owner: req.headers.currentuser 
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const updates = { ...req.body };
    console.log(updates)
    
    // Parse JSON fields if they are strings
    if (typeof updates.contact === 'string') updates.contact = JSON.parse(updates.contact);
    if (typeof updates.location === 'string') updates.location = JSON.parse(updates.location);
    if (typeof updates.categories === 'string') updates.categories = JSON.parse(updates.categories);
    if (typeof updates.openingHours === 'string') updates.openingHours = JSON.parse(updates.openingHours);
    if (typeof updates.taxInfo === 'string') updates.taxInfo = JSON.parse(updates.taxInfo);
    if (typeof updates.socialMedia === 'string') updates.socialMedia = JSON.parse(updates.socialMedia);

    Object.keys(updates).forEach(key => {
      store[key] = updates[key];
    });

    await store.save();
    res.json(store);
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message });
  }
});



















// Delete store
router.delete('/:id', async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.headers.currentuser 
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});









// Get user's store
router.get('/my-store', async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.headers.currentuser });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});




router.get('/:id', storeController.getStoresById);

module.exports = router;