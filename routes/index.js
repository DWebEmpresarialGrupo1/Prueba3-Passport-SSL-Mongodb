'use strict'

var request = require('request');
const path = require('path');
const Noticia = require(path.join(__dirname, '..', 'app', 'models', 'noticia'));
const User = require(path.join(__dirname, '..', 'app', 'models', 'user'));
var Q = require('q');
module.exports = function (app) {
    // Render the home page.

    /**
     * Funcion que retorna todas las noticias del sistema
     * @returns {Promise}
     */
    function retornarNoticias() {
        return new Promise(
            function (cumplido, noCumplido) {
                Noticia.find().sort('-fecha')
                    .exec(function (err, noticias) {
                        if (err) {
                            cumplido(false);
                            return;
                        } else {
                            cumplido(noticias);
                            return;
                        }
                    });
            }//endfunction (cumplido, noCumplido)
        );//end new Promise
    }

    /**
     * Busca en la base de datos al usuario y retorna las noticias populadas de este.
     * @param usuarioId
     * @returns {Promise}
     */
    function noticiasUsuario(usuarioId) {
        return new Promise(
            function (cumplido, noCumplido) {
                User.findById(usuarioId).populate('noticiasGuardadas').sort('-fecha')
                    .exec(function (err, user) {
                        if (err) {
                            cumplido(false);
                            return;
                        } else {
                            cumplido(user.noticiasGuardadas);
                            return;
                        }
                    });
            }//endfunction (cumplido, noCumplido)
        );//end new Promise
    }

    /**
     * Funcion que guarda una noticia en la BD
     * @param noticia
     * @returns {Promise}
     * @constructor
     */
    function GuardarNoticias(noticia) {
        return new Promise(
            function (cumplido, noCumplido) {
                noticia.save(function (err) {
                    if (err) {
                        return;
                    } else {
                        cumplido(noticia)
                        return;
                    }
                });
            }//endfunction (cumplido, noCumplido)
        );//end new Promise
    }

    app.get('/', function (req, res, next) {
        console.log(req.isAuthenticated())
        console.log('Cargando Noticias');
        console.log(req.csrfToken());
        var noticiasCargadas = [];
        retornarNoticias().then(function (noticias) {
            if (!noticias.length) {
                console.log('No Hay noticias en la bd! Cargando...');
                request('https://newsapi.org/v1/articles?source=techcrunch&apiKey=fbb11c08a1684caf8b88f3be2c8b4a50', function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var api = JSON.parse(body)
                        // console.log(info.articles);
                        for (var i = 0; i < api.articles.length; i++) {
                            //   console.log(api.articles[i].title);
                            var fecha = new Date(api.articles[i].publishedAt);
                            fecha = fecha.toDateString();
                            var noticia = new Noticia({
                                titulo: api.articles[i].title,
                                cuerpo: api.articles[i].description,
                                imagen: api.articles[i].urlToImage,
                                url: api.articles[i].url,
                                fecha: fecha
                            });
                            noticiasCargadas.push(GuardarNoticias(noticia));
                        }
                        Q.all(noticiasCargadas).then(
                            function (noticias) {
                                if (req.isAuthenticated()) {
                                    console.log(req.user.agrupaciones);
                                    res.render('noticias', {
                                        title: 'Noticias!!!',
                                        noticias: noticias,
                                        user: req.user,
                                        csrfToken: req.csrfToken(),
                                    });
                                } else {
                                    res.render('noticias', {
                                        title: 'Noticias!!!',
                                        noticias: noticias,
                                        user: false,
                                        csrfToken: req.csrfToken(),
                                        noticiasGuardadas: [],
                                    });
                                }
                                ;

                            }).catch(function (asignaturas) {

                        });
                    }

                });
            } else {
                console.log('Si existen noticias en la bd!')
                Noticia.find().sort('-fecha')
                    .exec(function (err, noticias) {
                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (req.isAuthenticated()) {
                                console.log(req.user._id);
                                noticiasUsuario(req.user._id).then(function (noticiasGuardadas) {
                                    res.render('noticias', {
                                        title: 'Noticias!!!',
                                        noticias: noticias,
                                        user: req.user,
                                        csrfToken: req.csrfToken(),
                                        noticiasGuardadas: noticiasGuardadas
                                    });
                                })

                            } else {
                                res.render('noticias', {
                                    title: 'Noticias!!!',
                                    noticias: noticias,
                                    user: false,
                                    csrfToken: req.csrfToken(),
                                    noticiasGuardadas: [],
                                });
                            }
                            ;
                        }
                    });
            }
        });
    });

    // Render the profile page.
    app.post('/verMasTarde', function (req, res, next) {
        console.log(req.body);
        User.findByIdAndUpdate(req.body.userId, {
            $push: {
                noticiasGuardadas: req.body.noticiaId
            }
        }).populate("noticiasGuardadas")
            .exec(function (err, user) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                if (!user) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    retornarNoticias().then(function (noticias) {
                        noticiasUsuario(req.body.userId).then(function (noticiasGuardadas) {
                            res.redirect('/');
                        });


                    });
                }
            });
    });

    app.post('/borrarNoticiaGuardada', function (req, res, next) {


    {
        User.findByIdAndUpdate(req.body.userId, {
            $pullAll: {
                noticiasGuardadas: [req.body.noticiaId]
            }
        }).populate("noticiasGuardadas")
            .exec(function (err, user) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                if (!user) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {

                    res.redirect('/');

                }

            });
    }
    });

    // Render the profile page.
    app.get('/profile', isLoggedIn, function (req, res, next) {
        res.render('profile', {
            title: 'Autenticacion con Node.js',
            user: req.user
        });
    });

    // Render the profile page.
    app.get('/profile', isLoggedIn, function (req, res, next) {
        res.render('profile', {
            title: 'Autenticacion con Node.js',
            user: req.user
        });
    });

    // :-D
    app.get('/ping', function (req, res, next) {
        const url = "http://www.10puntos.com/wp-content/uploads/2011/09/bender-421572.jpeg"
        res.status(200).send("<img src='" + url + "' />");
    });

    // Route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/');
    }
};
