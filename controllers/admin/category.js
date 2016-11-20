const Category = require('mongoose').model('Category');

module.exports = {
    all: (req, res, next) => {
        Category.find({}).then(categories => {
            res.render('admin/category/all', {categories: categories})
        })
    },

    createGet: (req, res, next) => {
        res.render('admin/category/create')
    },

    createPost: (req, res, next) => {
        let categoryArgs = req.body
        let errorMsg = '';

        if (!categoryArgs.name) {
            errorMsg = 'Category name cannot be null';
            categoryArgs.error = errorMsg;
            res.render('admin/category/create', categoryArgs)
        }
        else {
            Category.create(categoryArgs).then(category => {
                res.redirect('/admin/category/all')
            }).catch(err => {
                errorMsg = err.message;
                categoryArgs.error = errorMsg;
                res.render('admin/category/create', categoryArgs)
            })
        }
    }
}


