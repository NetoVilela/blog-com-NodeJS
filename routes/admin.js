const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {eAdmin} = require('../helpers/eAdmin');


require('../models/Categoria');
const Categoria = mongoose.model("categorias"); //O nome desse model foi definido no Categoria.js

require('../models/Postagem');
const Postagem = mongoose.model('postagens');

//*Rota principal
router.get('/',eAdmin,function(req,res){
    res.render("admin/index");
});

//!--------------------------------------PARTE DE CATEGORIAS-------------------------------------------
//* INÍCIO Lista Categorias
router.get('/categorias',eAdmin,function(req,res){
    Categoria.find().sort({date: 'desc'}).then((categorias)=>{
        res.render('./admin/categorias', {
            categorias: categorias.map(categoria => categoria.toJSON())
        })    
    })
.catch((erro)=>{
        req.flash("error_msg","Houve um erro ao listar as categorias");
        res.redirect('/admin');
    });
    
});
//* FIM Lista Categorias

//* INÍCIO Cadastro de categorias--------------------
router.get('/categorias/add',eAdmin,(req,res)=>{
    res.render("admin/addcategorias");
})

router.post('/categorias/nova',eAdmin,(req,res)=>{
    //validação de formulários 
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text:"Nome inválido"});
    }
    if(!req.body.slug || typeof req.body.slug ==undefined || req.body.slug == null){
        erros.push({text:"Slug inválido"});
    }
    if(req.body.nome.length <2){
        erros.push({text: "Nome da categoria muito pequeno"});
    }
    if(erros.length > 0){
        res.render("admin/addcategorias",{erros: erros});
    }else{
        const novaCategoria={
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash('success_msg',"Categoria criada com sucesso!");
            res.redirect('/admin/categorias')
        }).catch(()=>{
            req.flash("error_msg","Houve um erro ao salvar a categoria, tente novamente.");
            res.redirect("/admin");
        });
    } 
});
//* FIM Cadastro de categorias--------------------

//* INÍCIO Edição de Categorias---------------------------
router.get('/categorias/edit/:id',eAdmin,(req,res)=>{
    Categoria.findOne({_id: req.params.id}).lean().then((categoria)=>{
        res.render('admin/editCategoria',{categoria: categoria});
    }).catch((error)=>{
        req.flash("error_msg","Esta categoria não existe");
        res.redirect('/admin/categorias');
    })
    
});
router.post('/categorias/edit',eAdmin,(req,res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
        //*Não fiz sistema de validação
        categoria.nome = req.body.nome,
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg","Categoria editada com sucesso!");    
            res.redirect('/admin/categorias');
        }).catch((error)=>{
            req.flash("error_msg","Erro ao salvar a categoria editada");
            res.redirect('/admin/categorias');
        });

    }).catch((error)=>{
        req.flash("error_msg","Houve um erro ao editar a categoria");
        res.redirect('/admin/categorias')
    });
});
//* FIM Edição de Categorias---------------------------

//* INÍCIO Delete de categorias-----------------------
router.get('/categorias/delete/:id',eAdmin,(req,res)=>{
    Categoria.findOneAndRemove({_id: req.params.id}).then(()=>{
        req.flash("success_msg","Categoria removida com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((error)=>{
        req.flash("error_msg","Erro ao remover a categoria: "+error);
        res.redirect("/admin/categorias");
    });
});
//* FIM Delete de categorias-----------------------
//!--------------------------------------PARTE DE POSTAGENS-------------------------------------------
//* INÍCIO Listagem de postagens---------------------
router.get('/postagens',eAdmin,(req,res)=>{
    Postagem.find().populate("categoria").sort({data: 'desc'}).lean().then((postagens)=>{
        res.render("admin/postagens",{postagens: postagens});
    })
    
});
//* FIM Listagem de postagens---------------------

//* INÍCIO Add Postagens---------------------------
router.get('/postagens/add',eAdmin,(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('admin/addPostagens',{categorias: categorias});
    }).catch((error)=>{
        req.flash("error_msg", "Erro ao obter as categorias");
        res.redirect('/admin');
    });
});
router.post('/postagens/nova',eAdmin,(req,res)=>{  
    var erros=[];
    if(req.body.categoria=="0"){//Validação
        erros.push({texto: "Nenhuma categoria selecionada"});
    }
    if(erros.length>0){
        res.render('admin/addPostagens', {erros: erros})
    }else{
        const novaPostagem={
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg","Postagem criada com sucesso!");
            res.redirect('/admin/postagens');
        }).catch((error)=>{
            req.flash("error_msg",`Erro ao cadastrar uma nova postagem ${error}`);
            res.redirect('/admin/postagens');
        });
    }
});
//* FIM Add Postagens---------------------------

//* INÍCIO Edição de Postagens-------------------------
    router.get('/postagens/edit/:id',eAdmin,(req,res)=>{
        Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{

            Categoria.find().lean().then((categorias)=>{

                res.render('admin/editPostagens',{postagem:postagem, categorias:categorias});

            }).catch((error)=>{

                req.flash("error_msg","Erro ao enviar as categorias para a página de edição de postagem");
                req.redirect('/postagens');

            })
            
        }).catch((error)=>{

            req.flash("error_msg","Erro ao editar a postagem");
            req.redirect('/postagens');

        })
    });

    router.post('/postagem/editada',eAdmin,(req,res)=>{
        Postagem.findOne({_id: req.body.id}).then((postagem)=>{
            postagem.titulo =req.body.titulo,
            postagem.slug = req.body.slug,
            postagem.coneudo = req.body.conteudo,
            postagem.categoria = req.body.categoria,
            postagem.descricao = req.body.descricao
            
            postagem.save().then(()=>{
                req.flash("success_msg","Postagem editada com sucesso!");
                res.redirect("/admin/postagens");
            }).catch((error)=>{
                req.flash("error_msg","Erro ao editar a postagem :(");
                res.redirect('/admin/postagens');
            });
        });
    });
//* FIM Edição de Postagens

//* INÍCIO Delete de Postagens
    router.get('/postagens/delete/:id',eAdmin,(req,res)=>{
        Postagem.remove({_id: req.params.id}).then(()=>{
            req.flash("success_msg","Postagem deleteda com sucesso! :)");
            res.redirect('/admin/postagens');
        }).catch((error)=>{
            req.flash("error_msg","Erro ao deletar a postagem :(");
            res.redirect("/admin/postagens");
        });
    });
//* FIM Delete de Postagens

module.exports=router;