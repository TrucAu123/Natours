const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const toursSchema = new Schema({
    name: String,
    price: Number,
    description:[String],
})

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;