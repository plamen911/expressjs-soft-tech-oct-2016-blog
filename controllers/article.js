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
        Article.create(articleArgs).then(article => {
            article.prepareInsert();
            res.redirect('/');
        });
    },

    editGet: (req, res, next) => {
        const id = req.params.id;

        if (!req.isAuthenticated()) {
            req.session.returnUrl = `/article/edit/${id}`
            return res.redirect('/user/login')
        }

        Article.findById(id)
            .then(article => {
                req.user.isInRole('Admin').then(isAdmin => {
                    if (!isAdmin && !req.user.isAuthor(article)) {
                        return res.redirect('/');
                    }
                    res.render('article/edit', article);
                })
            })
            .catch(err => {
                res.render('article/edit', {error: err.message});
            })

    },

    editPost: (req, res, next) => {
        const id = req.params.id;

        let articleArgs = req.body

        if (!req.isAuthenticated()) {
            req.session.returnUrl = `/article/edit/${id}`
            return res.redirect('/user/login')
        }

        let errorMsg = ''
        if (!articleArgs.title) {
            errorMsg = 'Article title cannot be empty!'
        } else if (!articleArgs.content) {
            errorMsg = 'Article content cannot be empty!'
        }

        if (errorMsg) {
            return res.render('article/edit', {error: errorMsg})
        }

        Article.findById(id)
            .then(article => {
                req.user.isInRole('Admin').then(isAdmin => {
                    if (!isAdmin && !req.user.isAuthor(article)) {
                        return res.redirect('/');
                    }

                    Article
                        .update({_id: id},
                            {
                                $set: {
                                    title: articleArgs.title,
                                    content: articleArgs.content
                                }
                            })
                        .then(updateStatus => {
                            res.redirect(`/article/details/${id}`);
                        })
                        .catch(err => {
                            res.render('article/details', {error: err.message});
                        })
                })
            })
            .catch(err => {
                res.render('article/edit', {error: err.message});
            })
    },

    deleteGet: (req, res, next) => {
        const id = req.params.id;

        if (!req.isAuthenticated()) {
            req.session.returnUrl = `/article/delete/${id}`
            return res.redirect('/user/login')
        }

        Article
            .findById(id)
            .then(article => {
                req.user.isInRole('Admin').then(isAdmin => {
                    if (!isAdmin && !req.user.isAuthor(article)) {
                        return res.redirect('/');
                    }
                    res.render('article/delete', article);
                })
            })
            .catch(err => {
                res.render('article/delete', {error: err.message});
            })
    },

    deletePost: (req, res, next) => {
        const id = req.params.id;

        if (!req.isAuthenticated()) {
            req.session.returnUrl = `/article/delete/${id}`
            return res.redirect('/user/login')
        }

        Article
            .findById(id)
            .then(article => {
                req.user.isInRole('Admin').then(isAdmin => {
                    if (!isAdmin && !req.user.isAuthor(article)) {
                        return res.redirect('/');
                    }

                    Article.findOneAndRemove({_id: id}).then(article => {
                        article.prepareDelete();
                        res.redirect('/');
                    });
                })
            })
            .catch(err => {
                res.render('article/delete', {error: err.message});
            })
    },

    details: (req, res, next) => {
        const id = req.params.id;

        Article.findById(id).populate('author').then(article => {
            if (!req.user) {
                return res.render('article/details', { article: article, isUserAuthorized: false });
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorized = isAdmin || req.user.isAuthor(article)
                res.render('article/details', { article: article, isUserAuthorized: isUserAuthorized });
            });

        })
            .catch(err => {
                res.render('article/details', {error: err.message});
            })
    }
};
