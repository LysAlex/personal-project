/*
Imports
*/
    // Node
    const express = require('express');

    // NPM
    const bcrypt = require('bcryptjs');

    // Inner
    const PostModel = require('../models/post.schema');
    const UserModel = require('../models/user.schema');
    const WritingModel = require('../models/writing.schema');
//

/*
Routes definition
*/
    class CrudMongoRouterClass {

        // Inject Passport to secure routes
        constructor({ passport }) {
            // Instanciate router
            this.router = express.Router();

            // Instanciatee passport
            this.passport = passport;
        };
        
        // Set route fonctions
        routes(){

            /* 
            AUTH: Register 
            */
                this.router.post('/auth/register', (req, res) => {
                    // Encrypt user password
                    bcrypt.hash( req.body.password, 10 )
                    .then( hashedPassword => {
                        // Change user password
                        req.body.password = hashedPassword;
                        
                        // Save user data
                        UserModel.create(req.body)
                        .then( document => res.status(201).json({
                            method: 'POST',
                            route: `/api/mongo/auth/register`,
                            data: document,
                            error: null,
                            status: 201
                        }))
                        .catch( err => res.status(502).json({
                            method: 'POST',
                            route: `/api/mongo/auth/register`,
                            data: null,
                            error: err,
                            status: 502
                        }));
                    })
                    .catch( hashError => res.status(500).json({
                        method: 'POST',
                        route: `/api/mongo/auth/register`,
                        data: null,
                        error: hashError,
                        status: 500
                    }));
                });
            //

            /* 
            AUTH: Login 
            */
                this.router.post('/auth/login', (req, res) => {
                    // Get user from email
                    UserModel.findOne({ email: req.body.email }, (err, user) => {
                        if(err){
                            return res.status(500).json({
                                method: 'POST',
                                route: `/api/mongo/auth/login`,
                                data: null,
                                error: err,
                                status: 500
                            });
                        }
                        else{
                            // Check user password
                            const validPassword = bcrypt.compareSync(req.body.password, user.password);
                            if( !validPassword ){
                                return res.status(500).json({
                                    method: 'POST',
                                    route: `/api/mongo/auth/login`,
                                    data: req.body.password,
                                    error: 'Invalid password',
                                    status: 500
                                });
                            }
                            else{
                                // Generate user JWT
                                res.cookie(process.env.COOKIE_NAME, user.generateJwt(user));

                                // Return user data
                                return res.status(201).json({
                                    method: 'POST',
                                    route: `/api/mongo/auth/login`,
                                    data: user,
                                    error: null,
                                    status: 201
                                });
                            };
                        };
                    });
                });
            //

            /* 
            AUTH: Me 
            */
                this.router.get('/auth/me', this.passport.authenticate('jwt', { session: false }), (req, res) => {
                    // Get user info and post list from user _id (req.user._id)
                    Promise.all([
                        UserModel.findById(req.user._id),
                        PostModel.find({ author: req.user._id })
                    ])
                    .then( mongoData => {
                        return res.status(200).json({
                            method: 'POST',
                            route: `/api/mongo/auth/me`,
                            data: { user: mongoData[0], posts: mongoData[1],  },
                            error: null,
                            status: 200
                        });
                    })
                    .catch( mongoErr => {
                        return res.status(500).json({
                            method: 'POST',
                            route: `/api/mongo/auth/me`,
                            data: null,
                            error: mongoErr,
                            status: 500
                        });
                    });
                });
            //
            // Create Writing
             this.router.post('/auth/writing', (req, res) => {
                    // Save user data
                    WritingModel.create(req.body)
                    .then( document => res.status(201).json({
                        method: 'POST',
                        route: `/api/mongo/auth/writing`,
                        data: document,
                        error: null,
                        status: 201
                    }))
                    .catch( err => res.status(502).json({
                        method: 'POST',
                        route: `/api/mongo/auth/writing`,
                        data: null,
                        error: err,
                        status: 502
                    }));
                });
            // Get All Writing
             this.router.get('/auth/writing/', (req, res) => {
                 console.log(req);
                WritingModel.find({}, (err, data) => {
                    if(err){
                        console.log(err)
                        res.status(502).json({
                            method: 'GET',
                            route: `/api/mongo/auth/writing`,
                            data: null,
                            error: err,
                            status: 502
                        })
                   } else {
                    res.status(201).json({
                        method: 'GET',
                        route: `/api/mongo/auth/writing`,
                        data: data,
                        error: null,
                        status: 201
                   })
                }})});

            // Get One Writing
            this.router.get('/auth/writing/:id', (req, res) => {
                WritingModel.findById(req.params.id)
                .then( document => res.status(200).json({
                    method: 'GET',
                    route: `/api/mongo/auth/writing/${req.params.id}`,
                    data: document,
                    error: null,
                    status: 200
                }))
                .catch( err => res.status(502).json({
                    method: 'GET',
                    route: `/api/mongo/auth/writing/${req.params.id}`,
                    data: null,
                    error: err,
                    status: 502
                }));
            });

                 /* 
            CRUD: Update route 
            */
           this.router.put('/auth/writing/:id', (req, res) => {
            WritingModel.findById(req.params.id)
            .then( document => {
                // Update document
                document.title = req.body.title;
                document.content = req.body.content;
                
                // Save document
                document.save()
                .then( updatedDocument => res.status(200).json({
                    method: 'PUT',
                    route: `/api/mongo/auth/writing/${req.params.id}`,
                    data: updatedDocument,
                    error: null,
                    status: 200
                }))
                .catch( err => res.status(502).json({
                    method: 'PUT',
                    route: `/api/mongo/auth/writing/${req.params.id}`,
                    data: null,
                    error: err,
                    status: 502
                }));
            })
            .catch( err => res.status(404).json({
                method: 'PUT',
                route: `/api/mongo/${req.params.endpoint}/${req.params.id}`,
                data: null,
                error: err,
                status: 404
            }));
        });
    //
            
            /* 
            CRUD: Delete route 
            */
           this.router.delete('/auth/writing/delete/:id', async (req, res) => {
            try {
              const data = await WritingModel.findOneAndDelete({ _id: req.params.id });
              res.status(201).json({
                method: 'DELETE',
                route: `/api/mongo/auth/writing/delete/${req.params.id}`,
                data: data,
                error: null,
                status: 201
              })
            } catch (err) {
              res.status(502).json({
                method: 'DELETE',
                route: `/api/mongo/auth/writing/delete/${req.params.id}`,
                data: null,
                error: err,
                status: 502
              })
            }
          })
    //
        };
            

           

        // Start router
        init(){
            // Get route fonctions
            this.routes();

            // Sendback router
            return this.router;
        };
    };
//

/*
Export
*/
    module.exports = CrudMongoRouterClass;
//