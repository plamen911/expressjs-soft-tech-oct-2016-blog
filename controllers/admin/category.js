const Category = require('mongoose').model('Category')

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
    let errorMsg = ''

    if (!categoryArgs.name) {
      errorMsg = 'Category name cannot be null'
      categoryArgs.error = errorMsg
      res.render('admin/category/create', categoryArgs)
    }
    else {
      Category.create(categoryArgs).then(category => {
        res.redirect('/admin/category/all')
      }).catch(err => {
        errorMsg = err.message
        categoryArgs.error = errorMsg
        res.render('admin/category/create', categoryArgs)
      })
    }
  },

  editGet: (req, res, next) => {
    let id = req.params.id

    Category.findById(id).then(category => {
      res.render('admin/category/edit', {category: category})
    })
  },

  editPost: (req, res, next) => {
    let id = req.params.id
    let editArgs = req.body

    if (!editArgs.name) {
      let errorMsg = 'Category name cannot be null'
      Category.findById(id).then(category => {
        res.render('admin/category/edit', {category: category, error: errorMsg})
      })
    } else {
      Category.findOneAndUpdate({_id: id}, {name: editArgs.name}).then(category => {
        res.redirect('/admin/category/all')
      })
    }
  },

  deleteGet: (req, res, next) => {
    let id = req.params.id

    Category.findById(id).then(category => {
      res.render('admin/category/delete', {category: category})
    })
  },

  deletePost: (req, res, next) => {
    let id = req.params.id

    Category.findOneAndRemove({_id: id}).then(category => {
      category.prepareDelete()
      res.redirect('/admin/category/all')
    })
  }
}

