const mongoose =  require('mongoose')
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// categories => field => ['type', 'color']
const categories_model =new Schema({
    type: { type : String, default: "Investment"},
    color : {type: String, default: '#FCBE44'}
})

// transactions  => field => ['name', 'type', 'amount', 'date', 'userId']
const transaction_model = new Schema({
    name: { type : String, default:"Anonymous"},
    type: { type : String, default:"Expenses"},
    amount: { type : Number},
    date: { type : Date, default : Date.now},
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

const Categories = mongoose.model('categories', categories_model)
const Transaction = mongoose.model('transaction', transaction_model);

// FoodItem => field => ['name', 'calories', 'protein', 'carbohydrates', 'fat']
const food_item_model = new Schema({
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number },
    carbohydrates: { type: Number },
    fat: { type: Number },
    imageUrl: { type: String } // New field for FoodItem image
});

// CalorieEntry => field => ['foodItemId', 'quantity', 'date', 'userId']
const calorie_entry_model = new Schema({
    foodItemId: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    quantity: { type: Number, default: 1 },
    date: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String } // New field for CalorieEntry image
});

const FoodItem = mongoose.model('FoodItem', food_item_model);
const CalorieEntry = mongoose.model('CalorieEntry', calorie_entry_model);

exports.default = Transaction;
module.exports = {
    Categories,
    Transaction,
    FoodItem,
    CalorieEntry,
    User
}

// User Model
const user_model = new Schema({
    username: { type: String, unique: true, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 }
});

// Hash password before saving
user_model.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
user_model.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', user_model);
