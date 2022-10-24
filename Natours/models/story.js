const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
    header: String,
    content: String,
    author: {
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})

const Story = mongoose.model('Story', storySchema);
module.exports = Story;