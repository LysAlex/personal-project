/*
Imports
*/
    // Node
    const express = require('express');

    // NPM
    const bcrypt = require('bcryptjs');
//

/*
Routes definition
*/
    class CrudMongoRouterClass {

        // Inject Passport to secure routes
        constructor(connection) {
            // Instanciate router
            this.router = express.Router();

            // Instanciate MYsql connection
            this.connection = connection;
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
                        this.connection.query(`INSERT INTO users SET ?`, req.body, (err, document) => {
                            if (err) {
                                return res.status(502).json({
                                    method: 'POST',
                                    route: `/api/mysql/auth`,
                                    data: null,
                                    error: err,
                                    status: 502
                                });
                            }
                            else{
                                return res.status(201).json({
                                    method: 'POST',
                                    route: `/api/mysql/auth`,
                                    data: document,
                                    error: null,
                                    status: 201
                                });
                            };
                        });
                    })
                    .catch( hashError => res.status(500).json({
                        method: 'POST',
                        route: `/api/mysql/auth/register`,
                        data: null,
                        error: hashError,
                        status: 500
                    }));
                });
            //

            /* 
            AUTH: Login 
            */
                this.router.post('/auth/login/:id', (req, res) => {
                    // Get user from email
                    this.connection.query(`SELECT * FROM users WHERE id=${req.params.id}`, (err, user) => {
                        if (err) {
                            return res.status(502).json({
                                method: 'POST',
                                route: `/api/mysql/auth/login`,
                                data: null,
                                error: err,
                                status: 502
                            });
                        }
                        else{
                            // Check user password
                            const validPassword = bcrypt.compareSync(req.body.password, user[0].password);
                            if( !validPassword ){
                                return res.status(500).json({
                                    method: 'POST',
                                    route: `/api/mysql/auth/login`,
                                    data: null,
                                    error: 'Invalid password',
                                    status: 500
                                });
                            }
                            else{
                                return res.status(201).json({
                                    method: 'POST',
                                    route: `/api/mysql/auth/login`,
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
            CRUD: Create route 
            */
                this.router.post('/:endpoint', (req, res) => {
                    this.connection.query(`INSERT INTO ${req.params.endpoint} SET ?`, req.body, (err, document) => {
                        if (err) {
                            return res.status(502).json({
                                method: 'POST',
                                route: `/api/mysql/${req.params.endpoint}`,
                                data: null,
                                error: err,
                                status: 502
                            });
                        }
                        else{
                            return res.status(201).json({
                                method: 'POST',
                                route: `/api/mysql/${req.params.endpoint}`,
                                data: document,
                                error: null,
                                status: 201
                            });
                        };
                    });
                });
            //

            /* 
            CRUD: Read all route 
            */
                this.router.get('/:endpoint', (req, res) => {
                    this.connection.query(`SELECT * FROM ${req.params.endpoint}`, (err, items) => {
                        if (err) {
                            return res.status(502).json({
                                method: 'GET',
                                route: `/api/mysql/${req.params.endpoint}`,
                                data: null,
                                error: err,
                                status: 502
                            });
                        }
                        else{
                            return res.status(200).json({
                                method: 'GET',
                                route: `/api/${req.params.endpoint}`,
                                data: items,
                                error: null,
                                status: 200
                            });
                        };
                    });
                });
            //

            /* 
            CRUD: Read one route
            */
                this.router.get('/:endpoint/:id', (req, res) => {
                    this.connection.query(`SELECT * FROM ${req.params.endpoint} WHERE id=${req.params.id}`, (err, item) => {
                        if (err) {
                            return res.status(502).json({
                                method: 'GET',
                                route: `/api/mysql/${req.params.endpoint}/${req.params.id}`,
                                data: null,
                                error: err,
                                status: 502
                            });
                        }
                        else{
                            return res.status(200).json({
                                method: 'GET',
                                route: `/api/mysql/${req.params.endpoint}/${req.params.id}`,
                                data: item,
                                error: null,
                                status: 200
                            });
                        };
                    });
                });
            //

            /* 
            CRUD: Update route 
            */
                this.router.put('/:endpoint/:id', (req, res) => {
                    this.connection.query(`
                        UPDATE ${req.params.endpoint} 
                        SET title = "${req.body.title}", content = "${req.body.content}" 
                        WHERE id = ${req.params.id}
                    `, req.body, (err, document) => {
                        if (err) {
                            return res.status(502).json({
                                method: 'PUT',
                                route: `/api/mysql/${req.params.endpoint}/${req.params.id}`,
                                data: null,
                                error: err,
                                status: 502
                            });
                        }
                        else{
                            return res.status(200).json({
                                method: 'PUT',
                                route: `/api/mysql/${req.params.endpoint}/${req.params.id}`,
                                data: document,
                                error: null,
                                status: 200
                            });
                        };
                    });
                });
            //

            /* 
            CRUD: Delete route 
            */
                this.router.delete('/:endpoint/:id', (req, res) => {
                    this.connection.query(`
                        DELETE FROM ${req.params.endpoint} 
                        WHERE id = ${req.params.id}
                    `, req.body, (err, deletedDocument) => {
                        if (err) {
                            return res.status(502).json({
                                method: 'PUT',
                                route: `/api/mysql/${req.params.endpoint}/${req.params.id}`,
                                data: null,
                                error: err,
                                status: 502
                            });
                        }
                        else{
                            return res.status(200).json({
                                method: 'PUT',
                                route: `/api/mysql/${req.params.endpoint}/${req.params.id}`,
                                data: deletedDocument,
                                error: null,
                                status: 200
                            });
                        };
                    });
                });
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