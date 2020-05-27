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
const helpers = require('handlebars-helpers')();

//*Configurações

    //*Sessão
    app.use(session({
        secret: 'qualquerCoisa',
        resave: true,
        saveUninitialized: true
    }));

    //*Flash
    app.use(flash());

    //*Middleware
    app.use((req,res,next)=>{
        res.locals.success_msg=req.flash("success_msg");  //Cria variável global
        res.locals.error_msg=req.flash("error_msg");
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

    app.use('/admin',admin);


//*Outros
const PORT = 8081;
app.listen(PORT,()=>{
    console.log("Servidor rodando na porta 8081");
})