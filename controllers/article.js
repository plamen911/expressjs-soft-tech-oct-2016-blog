const Article = require('mongoose').model('Article')
const Category = require('mongoose').model('Category')
const Tag = require('mongoose').model('Tag')
const initializeTags = require('./../models/Tag').initializeTags

module.exports = {
  createGet: (req, res) => {
        // validations
    let errorMsg = ''

    if (!req.isAuthenticated()) {
      errorMsg = 'You should be logged in to create articles.'
    }

    if (errorMsg) {
      req.session.returnUrl = '/article/create'
      req.flash('error', errorMsg)
      return res.redirect('/user/login')
            // return res.render('article/create', {error: errorMsg});
    }

    Category.find({}).then(categories => {
      res.render('article/create', {error: req.flash('error'), categories: categories})
    })
  },

  createPost: (req, res, next) => {
    let articleArgs = req.body

        // validations
    let errorMsg = ''

    if (!req.isAuthenticated()) {
      errorMsg = 'You should be logged in to create articles.'
    } else if (!articleArgs.title) {
      errorMsg = 'Invalid title!'
    } else if (!articleArgs.content) {
      errorMsg = 'Invalid content!'
    }

    if (errorMsg) {
      return res.render('article/create', {error: errorMsg})
    }

    articleArgs.author = req.user.id
    articleArgs.tags = []
    Article.create(articleArgs).then(article => {
      let tagNames = articleArgs.tagNames.split(/\s+|,/).filter(tag => {
        return tag
      })
      initializeTags(tagNames, article.id)

      article.prepareInsert()
      res.redirect('/')
    })
  },

  editGet: (req, res, next) => {
    const id = req.params.id

    if (!req.isAuthenticated()) {
      req.session.returnUrl = `/article/edit/${id}`
      return res.redirect('/user/login')
    }

    Article.findById(id).populate('tags').then(article => {
      req.user.isInRole('Admin').then(isAdmin => {
        if (!isAdmin && !req.user.isAuthor(article)) {
          return res.redirect('/')
        }

        Category.find({}).then(categories => {
          let catg = []
          for (let i = 0; i < categories.length; i++) {
            catg.push({
              id: categories[i]._id,
              name: categories[i].name,
              isSelected: article.category.toString() === categories[i]._id.toString()
            })
          }

          article.categories = catg
          article.tagNames = article.tags.map(tag => {
            return tag.name
          })

          res.render('article/edit', article)
        })
      })
    })
            .catch(err => {
              res.render('article/edit', {error: err.message})
            })
  },

  editPost: (req, res, next) => {
    const id = req.params.id

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

    Article.findById(id).populate('category tags').then(article => {
      if (article.category.id !== articleArgs.category) {
        article.category.articles.remove(article.id)
        article.category.save()
      }

      article.category = articleArgs.category
      article.title = articleArgs.title
      article.content = articleArgs.content

      let newTagNames = articleArgs.tagNames.split(/\s+|,/).filter(tag => {
        return tag
      })

            // Get the old article's tags witch are not re-entered
      let oldTags = article.tags
                .filter(tag => {
                  return newTagNames.indexOf(tag.name) === -1
                })

      for (let tag of oldTags) {
        tag.deleteArticle(article.id)
        article.deleteTag(tag.id)
      }

      initializeTags(newTagNames, article.id)

      article.save((err) => {
        if (err) {
          console.log('Error saving article: ', err)
        }

        Category.findById(article.category).then(category => {
          if (category.articles.indexOf(article.id) === -1) {
            category.articles.push(article.id)
            category.save()
          }

          res.redirect(`/article/details/${id}`)
        })
      })
    })
  },

  deleteGet: (req, res, next) => {
    const id = req.params.id

    if (!req.isAuthenticated()) {
      req.session.returnUrl = `/article/delete/${id}`
      return res.redirect('/user/login')
    }

    Article.findById(id).populate('category tags').then(article => {
      req.user.isInRole('Admin').then(isAdmin => {
        if (!isAdmin && !req.user.isAuthor(article)) {
          return res.redirect('/')
        }

        article.tagNames = article.tags.map(tag => { return tag.name })
        res.render('article/delete', article)
      })
    })
            .catch(err => {
              res.render('article/delete', {error: err.message})
            })
  },

  deletePost: (req, res, next) => {
    const id = req.params.id

    if (!req.isAuthenticated()) {
      req.session.returnUrl = `/article/delete/${id}`
      return res.redirect('/user/login')
    }

    Article
            .findById(id)
            .then(article => {
              req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(article)) {
                  return res.redirect('/')
                }

                Article.findOneAndRemove({_id: id}).then(article => {
                  article.prepareDelete()
                  res.redirect('/')
                })
              })
            })
            .catch(err => {
              res.render('article/delete', {error: err.message})
            })
  },

  details: (req, res, next) => {
    const id = req.params.id

    Article.findById(id).populate('author tags').then(article => {
      if (!req.user) {
        return res.render('article/details', {article: article, isUserAuthorized: false})
      }

      req.user.isInRole('Admin').then(isAdmin => {
        let isUserAuthorized = isAdmin || req.user.isAuthor(article)
        res.render('article/details', {article: article, isUserAuthorized: isUserAuthorized})
      })
    })
            .catch(err => {
              res.render('article/details', {error: err.message})
            })
  }
}
