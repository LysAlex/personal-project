/*
Import
*/
    const mongoose = require('mongoose');
    const { Schema } = mongoose;
//


/*
Definition
*/
    const MySchema = new Schema({
        title: String,
        content: String,
        author: String
    });
//

/*
Export
*/
    const MyModel = mongoose.model('writing', MySchema);
    module.exports = MyModel;
//