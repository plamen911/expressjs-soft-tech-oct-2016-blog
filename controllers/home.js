const mongoose = require('mongoose')
const Article = mongoose.model('Article')

module.exports = {
    index: (req, res) => {
        Article
            .find({})
            .limit(6)
            .populate('author')
            .then(articles => {
                res.render('home/index', {
                    error: req.flash('error'),
                    articles: articles
                });
            })
    }
};