const routes = require('express').Router();
const controller = require('../controller/controller');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig'); // Import multer middleware

// Public routes (Categories can remain public for now as per original app)
routes.route('/api/categories')
    .post(controller.create_Categories) // Or protect if categories should be user-specific
    .get(controller.get_Categories);

// Protected routes
routes.route('/api/transaction')
    .post(authMiddleware, controller.create_Transaction)
    .get(authMiddleware, controller.get_Transaction)
    .delete(authMiddleware, controller.delete_Transaction);

routes.route('/api/labels')
    .get(authMiddleware, controller.get_Labels);

// Food Item routes (Assuming these should be protected, adjust if they are global)
routes.route('/api/fooditems')
    .post(authMiddleware, controller.create_FoodItem) // If food items are user-specific
    .get(authMiddleware, controller.get_FoodItems);   // Or global, remove authMiddleware

// Calorie Entry routes
routes.route('/api/calorieentries')
    .post(authMiddleware, controller.create_CalorieEntry)
    .get(authMiddleware, controller.get_CalorieEntries);

routes.route('/api/calorieentries/:id')
    .delete(authMiddleware, controller.delete_CalorieEntry);

// Auth routes
routes.route('/api/auth/signup')
    .post(controller.signup);

routes.route('/api/auth/login')
    .post(controller.login);

routes.route('/api/auth/logout')
    .post(controller.logout); // Assuming a server-side logout for now

// Image Upload route (Protected)
routes.route('/api/upload-image')
    .post(authMiddleware, upload.single('image'), controller.upload_Image); // 'image' is the field name for the file

module.exports = routes;