const mongoose = require('mongoose')

let tagSchema = mongoose.Schema({
  name: {type: String, required: true, unique: true},
  articles: [{type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Article'}]
})

tagSchema.method({
    /* prepareDelete: function () {
        let Article = mongoose.model('Article');
        for (let article of this.articles) {
            Article.findById(article).then(article => {
                article.prepareDelete();
                article.remove()
            })
        }
    }, */
  prepareInsert: function () {
    let Article = mongoose.model('Article')
    for (let article of this.articles) {
      Article.findById(article).then(article => {
        if (article.tags.indexOf(this.id) === -1) {
          article.tags.push(this.id)
          article.save()
        }
      })
    }
  },

  deleteArticle: function (articleId) {
    this.articles.remove(articleId)
    this.save()
  }
})

tagSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(error)
  }
})

tagSchema.post('remove', function (doc) {
  console.log('Tag %s has been removed', doc._id)
})

tagSchema.set('versionKey', false)

const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag

module.exports.initializeTags = function (newTags, articleId) {
  for (let newTag of newTags) {
    if (newTag) {
      Tag.findOne({name: newTag}).then(tag => {
        if (tag) {
          if (tag.articles.indexOf(articleId) === -1) {
            tag.articles.push(articleId)
            tag.save()
          }
        } else {
          Tag.create({name: newTag}).then(tag => {
            tag.articles.push(articleId)
            tag.prepareInsert()
            tag.save()
          })
        }
      })
    }
  }
}

