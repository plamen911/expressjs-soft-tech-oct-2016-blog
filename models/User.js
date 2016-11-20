const mongoose = require('mongoose');
const Role = require('./Role')
const encryption = require('./../utilities/encryption');

let userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true},
    fullName: {type: String, required: true},
    salt: {type: String, required: true},
    articles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
});

userSchema.pre('save', function (next) {
    if (this.isNew) {
        console.log('Creating new user')
    }
    console.log('Saving');

    next();
});

userSchema.method({
    authenticate: function (password) {
        let inputPasswordHash = encryption.hashPassword(password, this.salt);
        // let isSamePasswordHash = inputPasswordHash === this.passwordHash;

        // return isSamePasswordHash;
        return inputPasswordHash === this.passwordHash;
    },

    isAuthor: function (article) {
        if (!article) {
            return false;
        }
        return article.author.equals(this.id)
    },

    isInRole: function (roleName) {
        return Role.findOne({name: roleName}).then(role => {
            if (!role) {
                return false
            }
            return this.roles.indexOf(role.id) !== -1
        });
    },

    prepareDelete: function (callback) {
        let Article = mongoose.model('Article');

        let deleteAllArticles = (idx) => {
            if (typeof this.articles[idx] === 'undefined') {
                callback()
            } else {
                let article = this.articles[idx];
                Article.findById(article).then(userArticle => {
                    userArticle.prepareDelete()
                    userArticle.remove()
                    deleteAllArticles(++idx)
                })
            }
        }

        let deleteAllRoles = (idx) => {
            if (typeof this.roles[idx] === 'undefined') {
                deleteAllArticles(0)
            } else {
                let role = this.roles[idx];
                Role.findById(role).then(userRole => {
                    userRole.users.remove(this.id);
                    userRole.save()
                    deleteAllRoles(++idx)
                })
            }
        }

        deleteAllRoles(0)
    },
    
    prepareInsert: function () {
        for (let role of this.roles) {
            Role.findById(role).then(userRole => {
                userRole.users.push(this.id);
                userRole.save()
            })
        }
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.seedAdmin = () => {
    let email = 'plamen326@gmail.com';
    User.findOne({email: email}).then(admin => {
        if (!admin) {
            Role.findOne({name: 'Admin'}).then(role => {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword('admin', salt);

                let roles = []
                roles.push(role.id)

                let user = {
                    email: email,
                    passwordHash: passwordHash,
                    fullName: 'Admin',
                    salt: salt,
                    articles: [],
                    roles: roles
                }

                User.create(user).then(user => {
                    role.users.push(user.id);
                    role.save(err => {
                        if (err) {
                            console.log(err.message)
                        } else {
                            console.log('Admin seeded successfully!')
                        }
                    })
                })
            })
        }
    })
}



