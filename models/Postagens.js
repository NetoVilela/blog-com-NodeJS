const mongoose = require('mongoose');

const Postagens = new mongoose.Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{         //Faz referência a uma categoria que já existe
        type: mongoose.Schema.Types.ObjectId,
        ref: "categorias", //O nome do model que será usado referenciado
        required: true
    },
    data:{
        type: Date,
        default: Date.now()
    }
});

mongoose.model("postagens", Postagens); //"postagens" é o nome da collection "Postagens" é o model