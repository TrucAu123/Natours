const Tour = require('../models/tours');
const Story = require('../models/story');
const descriptions= require('./description');
const{places,descriptors} = require('./seedHelpers');
// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/natours')
// .then(()=>{
//     console.log('connection open');
// })
// .catch(err =>{
//     console.log('error')
//     console.log(err)

// })
const mongoose = require('mongoose');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/natours';
mongoose.connect(dbUrl);   
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const sample =(array) =>{
    return array[Math.floor(Math.random()*array.length)]; // get random index from array
}
const seedDB = async()=>{
    for(let i = 0; i<30; i++){
        const price = Math.floor(Math.random()*100)+200;
        const random18= Math.floor(Math.random()*18);
        const newTour = new Tour({
            name: `${sample(descriptors)} ${sample(places)}`,
            price: price,
            description: descriptions[random18]
        })
        await newTour.save();
    }
    const story = new Story({
        header:'Amazing adventure for both me and my family',
        content:'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident',
        author:'63560ba502ea0316b1cc72a1'
    })
    await story.save();
}
seedDB().then(()=>{
    mongoose.connection.close();
});

