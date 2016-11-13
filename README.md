# Blog: Javascript and MongoDB
Software Technologies - октомври 2016, JavaScript Blog Basic Functionality

Complete walkthrough of creating a Blog application with the Express.js Framework, from setting up the framework through 
authentication module, ending up with creating a CRUD around MongoDB entities using Mongoose object - document model module.

#### OTHER
##### How to create a new repository on the command line

```
echo "# expressjs-exam-lets-build-twitter" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/plamen911/expressjs-exam-lets-build-twitter.git
git push -u origin master
```

#### How to push an existing repository from the command line

```
git remote add origin https://github.com/plamen911/expressjs-exam-lets-build-twitter.git
git push -u origin master
```

#### OTHER

- `db.getCollection('users').update({articles: {$exists: false}}, { $set: {articles: []}}, {multi: true})` - mass update query
