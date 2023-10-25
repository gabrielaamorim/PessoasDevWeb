const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

//Inicialização e Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', function (err, result) {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok – Servidor disponível.");
});

//Verificar em que porta o servidor está funcionando através do Console
app.get("/batata", (req, res) => {
    console.log("Response ok.");
    res.send("frita.");
});
app.get("/Vinland", (req, res) => {
    console.log("Response ok.");
    res.send("Saga.");
});
//Após dar um NPM Start ir no navegador e digitar: 
//http://localhost:9081 (Onde o 9081 é a porta em que você abriu)
// o (/batata) ou o (/Vinland) são "subpastas" onde consegue acessar com a URL:
//http://localhost:9081/batata e http://localhost:9081/Vinland

//no navegador é possível verificar os usuários no bando de dados
app.get("/usuarios", (req, res) => {
    try {
        client.query("SELECT * FROM Usuarios", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Chamou get usuarios");
        });
    } catch (error) {
        console.log(error);
    }
});

//No navegador dá para ver usuários específicos pelo ID colocando /usuarios/1(<- número do ID que quer vefificar)
app.get("/usuarios/:id", (req, res) => {
    try {
        console.log("Chamou /:id " + req.params.id);
        client.query("SELECT * FROM Usuarios WHERE id = $1", [req.params.id], (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                if(result.rowCount == 0){
                    res.send("Usuário com o código: "+ req.params.id + " não existe no BD.")
                }else{
                    res.send(result.rows)
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
});

//A partir daqui já não tem como fazer mais pelo navegador, mas serve para deletar , adicionar ou modificar coisas no banco
app.delete("/usuarios/:id", (req, res) => {
    try {
        console.log("Chamou delete /:id " + req.params.id);
        const id = req.params.id;
        client.query(
            "DELETE FROM Usuarios WHERE id = $1",
            [id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.status(400).json({ info: "Registro não encontrado." });
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.post("/usuarios", (req, res) => {
    try {
        console.log("Chamou post", req.body);
        const { nome, email, altura, peso } = req.body;
        client.query(
            "INSERT INTO Usuarios (nome, email, altura, peso) VALUES ($1, $2, $3, $4) RETURNING * ",
            [nome, email , altura , peso],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.put("/usuarios/:id", (req, res) => {
    try {
        console.log("Alguém enviou um update com os dados:", req.body);
        const id = req.params.id;
        const { nome, email, altura, peso } = req.body;
        client.query(
            "UPDATE Usuarios SET nome=$1, email=$2, altura=$3, peso=$4 WHERE id =$5 ",
            [nome, email, altura, peso, id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ id: id });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app; 
