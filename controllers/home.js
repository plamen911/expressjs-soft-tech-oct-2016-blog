const mongoose = require('mongoose')
const Article = mongoose.model('Article')
const User = mongoose.model('User')
const Category = mongoose.model('Category')
const Tag = mongoose.model('Tag')

const pagination = require('../utilities/pagination')

module.exports = {
  index: (req, res) => {
    Category.find({}).then(categories => {
      res.render('home/index', {categories: categories})
    })
  },

  old_listCategoryArticles: (req, res, next) => {
    let id = req.params.id

    Category.findById(id).populate('articles').then(category => {
      User.populate(category.articles, {path: 'author'}, (err) => {
        if (err) {
          console.log(err.message)
        }

        Tag.populate(category.articles, {path: 'tags'}, (err) => {
          if (err) {
            console.log(err.message)
          }

          res.render('home/article', {articles: category.articles})
        })
      })
    })
  },

    listCategoryArticles: (req, res, next) => {
        const id = req.params.id
        const limit = (req.query.limit && parseInt(req.query.limit, 10)) || 4
        const page = (req.query.page && parseInt(req.query.page, 10)) || 1

        const options = {
            populate: 'author category tags',
            sort: {title: 1, date: 1},
            lean: true,
            page: page,
            limit: limit
        }

        Article
            .paginate({category: id}, options)
            .then(result => {
                res.render('home/article', {
                  articles: result.docs,
                  pagination: pagination(req, result)
                })
            })
            .catch(err => {
                console.log(err.message)
            })
    }
}
