//* Carregando módulos
const express = require('express');
const app=express();                            //App
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const admin = require('./routes/admin');        //Para as rotas
const path = require('path');
const mongoose = require('mongoose'); 
const session = require('express-session');
const flash = require('connect-flash');
const usuarios = require('./routes/usuario');
const passport = require('passport');

require('./models/Postagem');
const Postagem =mongoose.model('postagens');

require('./models/Categoria');
const Categoria = mongoose.model('categorias');

require('./config/auth')(passport);

//*Configurações

    //*Sessão
    app.use(session({
        secret: 'qualquerCoisa',
        resave: true,
        saveUninitialized: true
    }));

    //* Usado para autenticação
    app.use(passport.initialize());
    app.use(passport.session());


    //*Flash
    app.use(flash());

    //*Middleware
    app.use((req,res,next)=>{
        res.locals.success_msg=req.flash("success_msg");  //Cria variável global
        res.locals.error_msg=req.flash("error_msg");
        res.locals.error=req.flash("error");
        res.locals.user=req.user || null;
        next();
    });

    //*Body-parser
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());

    //*Handlebars
    app.engine('handlebars',handlebars({defaultLayout:'main'}));
    app.set('view engine','handlebars');

    //*Mongoose
    mongoose.Promise=global.Promise;
    mongoose.connect("mongodb://localhost/blogapp").then(()=>{
        console.log("Conectado ao mongodb");
    }).catch((erro)=>{
        console.log("Erro ao conectar ao banco de dados: "+erro)
    });

    //*Public
    app.use(express.static(path.join(__dirname,"public")));//Fala pro express que a pasta public é a que guarda todos os arquivos estáticos


//*Rotas
    app.get('/',(req,res)=>{
        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
            res.render("index",{postagens: postagens});
        }).catch((error)=>{
            req.flash("error_msg","Não foi possível listar as postagens para a página principal");
            res.redirect('/404');
        })
    });

    app.get('/postagem/:slug',(req,res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render('postagem/index',{postagem: postagem});
            }else{
                req.flash("error_msg","Esta postagem não existe");
                res.redirect('/');
            }
        }).catch((error)=>{
            req.flash("error_msg","Houve um erro interno");
            res.redirect('/');
        })
    })

    app.get('/categorias/:slug',(req,res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
            if(categoria){

                    Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                        res.render('categorias/postagens', {postagens: postagens, categoria: categoria});
                    }).catch((error)=>{
                        req.flash("error_msg","Houve um erro ao listar os posts");
                        res.redirect("/");
                    });

            }else{
                req.flash("error_msg","Esta categoria não existe");
                res.redirect('/');
            }

        }).catch((error)=>{
            req.flash("error_msg","Houve um erro interno ao carregar a página desta categoria");
            res.redirect('/');
        })
    });

    app.get('/categorias',(req,res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render('categorias/index', {categorias: categorias});  
        }).catch((error)=>{
            req.flash("error_msg","Houve um erro interno ao listar as categorias");
            res.redirect('/');
        });
    });

    app.get('/404',(req,res)=>{
        res.send("ERROR 404- NOT FOUND");
    })
    app.use('/admin',admin);
    app.use('/usuarios',usuarios);
    



//*Outros
const PORT = 8081;
app.listen(PORT,()=>{
    console.log("Servidor rodando na porta 8081");
})