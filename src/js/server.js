// Mysql connection and API routes
const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

// ligação a BD
const db = mysql.createConnection({
    host: 'localhost',
    user: 'biblio',
    password: '12345',
    database: 'biblioteca'
});

db.connect(() => {
    console.log('Ligado a bd');
});

// rotas get, post, put e delete

app.get('/livros', (req, res) => {
    db.query('SELECT * FROM livros', (err, results) => {
        res.json(results);
    });
});

app.post('/livros', function (req, res) {
    const { titulo, autor, ano, genero } = req.body;
    db.query('INSERT INTO livros (titulo, autor, ano, genero) VALUES (?, ?, ?, ?)', [titulo, autor, ano, genero]);
    res.json({mensagem: 'Livro adicionado com sucesso!'});
});

app.put('/livros/:id', function (req, res) {
    const { id } = req.params;
    const { titulo, autor, ano, genero } = req.body;
    db.query('UPDATE livros SET titulo = ?, autor = ?, ano = ?, genero = ? WHERE id =?', [titulo, autor, ano, genero, id]);
    res.json({mensagem: 'Livro atualizado com id ' + id});
});

app.delete('/livros/:id', function (req, res) {
    const { id } = req.params;
    db.query('DELETE FROM livros WHERE id = ?', [id]);
    res.json({mensagem: 'Livro eliminado com id ' + id});
});

app.listen(3000, () => console.log('ligado a porto 3000'));