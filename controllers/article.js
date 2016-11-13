const Article = require('mongoose').model('Article');

module.exports = {
    createGet: (req, res) => {
        // validations
        let errorMsg = '';

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to create articles.';
        }

        if (errorMsg) {
            req.flash('error', errorMsg)
            return res.redirect('/user/login');
            //return res.render('article/create', {error: errorMsg});
        }

        res.render('article/create', {error: req.flash('error')});
    },

    createPost: (req, res, next) => {
        let articleArgs = req.body;

        // validations
        let errorMsg = '';

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to create articles.';
        } else if (!articleArgs.title) {
            errorMsg = 'Invalid title!';
        } else if (!articleArgs.content) {
            errorMsg = 'Invalid content!';
        }

        if (errorMsg) {
            return res.render('article/create', {error: errorMsg});
        }

        articleArgs.author = req.user.id;
        Article.create(articleArgs)
            .then(article => {
                req.user.articles.push(article.id);
                req.user.save(err => {
                    if (err) {
                        req.flash('error', err.message)
                        res.redirect('/article/create');
                    } else {
                        res.redirect('/');
                    }
                })
            })
    },

    details: (req, res, next) => {
        const id = req.params.id;

        Article
            .findById(id)
            .populate('author')
            .then(article => {
                res.render('article/details', article);
            })
            .catch(err => {
                res.render('article/details', {error: err.message});
            })
    }
};
