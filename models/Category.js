const mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
        name: {type: String, required: true, unique: true},
        articles: [{type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Article'}]
    }
);

categorySchema.method({
    prepareDelete: function () {
        let Article = mongoose.model('Article');
        for (let article of this.articles) {
            Article.findById(article).then(article => {
                article.prepareDelete();
                article.remove()
            })
        }
    }
})

categorySchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('There was a duplicate key error'));
    } else {
        next(error)
    }
})

categorySchema.set('versionKey', false)

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;


