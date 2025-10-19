const Product = require("../models/Product");
const Store = require("../models/Store");

exports.getStores = async (req, res) => {
  try {
    const { 
      city, 
      category, 
      page = 1, 
      limit = 10,
      latitude,
      longitude,
      search 
    } = req.query;
 
    // let query = { isActive: true, verificationStatus: 'verified' };
    let query = {  };
    
    // City filter
    if (city && city !== 'all') {
      query['location.city'] = new RegExp(city, 'i');
    }

    // Category filter
    if (category && category !== 'all') {
      query.categories = { $in: [new RegExp(category, 'i')] };
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: 'owner'
    };

    // If coordinates provided, sort by distance
    if (latitude && longitude) {
      options.sort = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
          }
        }
      };
    }

    const stores = await Store.paginate(query, options);
 
    res.json({
      success: true,
      data: stores.docs,
      pagination: {
        currentPage: stores.page,
        totalPages: stores.totalPages,
        totalItems: stores.totalDocs,
        hasNext: stores.hasNextPage,
        hasPrev: stores.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores'
    });
  }
};







exports.getStoresById = async (req, res) => {
  try {
    const { 
    id
    } = req.params;
 
    // let query = { isActive: true, verificationStatus: 'verified' };
  
 

    // Category filter
 

    
 

    const stores  = await Store.findById( id);
    const product  = await Product.find( {store:stores._id});

 
    res.json( {stores ,product });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores'
    });
  }
};




// Get unique cities for filter
exports.getCities = async (req, res) => {
  try {
    const cities = await Store.distinct('location.city', { 
      isActive: true, 
      verificationStatus: 'verified' 
    });
    
    res.json({
      success: true,
      data: cities.filter(city => city).sort()
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities'
    });
  }
};
exports.getStoreBySearch =  async (req, res) => {
  try {
    const { search, latitude, longitude } = req.query;
    
    if (!search) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let query = {
      $and: [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'location.address': { $regex: search, $options: 'i' } },
            { 'location.city': { $regex: search, $options: 'i' } },
            { categories: { $in: [new RegExp(search, 'i')] } }
          ]
        },
        { isActive: true }
      ]
    };

    let stores;
    
    // If location provided, sort by distance
    if (latitude && longitude) {
      stores = await Store.aggregate([
        {
          $match: query
        },
        {
          $addFields: {
            distance: {
              $sqrt: {
                $add: [
                  { $pow: [{ $subtract: ['$location.coordinates.latitude', parseFloat(latitude)] }, 2] },
                  { $pow: [{ $subtract: ['$location.coordinates.longitude', parseFloat(longitude)] }, 2] }
                ]
              }
            }
          }
        },
        { $sort: { distance: 1 } },
        { $limit: 20 }
      ]);
    } else {
      stores = await Store.find(query).limit(20);
    }

    res.json(stores);
  } catch (error) {
    console.error('Error searching stores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get store categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Store.aggregate([
      { $match: { isActive: true, verificationStatus: 'verified' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories' } },
      { $project: { _id: 0, name: '$_id' } }
    ]);

    res.json({
      success: true,
      data: categories.map(cat => cat.name).sort()
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

// Get nearby stores
exports.getNearbyStores = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10 } = req.query;
    console.log(req.query)
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

 
const stores = await Store.find({
  geo: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      $maxDistance: parseFloat(maxDistance) * 1000
    }
  }
}).limit(20);




 
    res.json(stores);
  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}