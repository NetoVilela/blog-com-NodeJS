const mongoose = require('mongoose');

const Usuario = new mongoose.Schema({
    nome:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    eAdmin:{
        type: Number,
        default: 0  //0-> Usuário | 1-> Admin
    },
    senha:{
        type: String,
        required: true
    }
});

mongoose.model('usuarios',Usuario);