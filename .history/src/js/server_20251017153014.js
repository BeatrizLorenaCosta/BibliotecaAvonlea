// ===== Backend MySql + API =====
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ligação à base de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'biblio',
    password: '12345',
    database: 'biblioteca'
});

db.connect(err => {
    if (err) throw err;
    console.log('✅ Ligado à base de dados biblioteca');
});

// -------- LIVROS --------
app.get('/api/livros', (req, res) => {
    db.query('SELECT * FROM livros', (err, results) => {
        if (err) return res.status(500).json({erro: err});
        res.json(results);
    });
});

app.post('/api/livros', (req, res) => {
    const { titulo, autor_id, categoria_id, ano, disponivel } = req.body;
    db.query(
        'INSERT INTO livros (titulo, autor_id, categoria_id, ano, disponivel) VALUES (?, ?, ?, ?, ?)',
        [titulo, autor_id, categoria_id, ano, disponivel],
        err => {
            if (err) return res.status(500).json({erro: err});
            res.json({mensagem: '📚 Livro adicionado com sucesso!'});
        }
    );
});

app.put('/api/livros/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, autor_id, categoria_id, ano, disponivel } = req.body;
    db.query(
        'UPDATE livros SET titulo=?, autor_id=?, categoria_id=?, ano=?, disponivel=? WHERE id_livro=?',
        [titulo, autor_id, categoria_id, ano, disponivel, id],
        err => {
            if (err) return res.status(500).json({erro: err});
            res.json({mensagem: `Livro atualizado (id=${id})`});
        }
    );
});

app.delete('/api/livros/:id', (req, res) => {
    db.query('DELETE FROM livros WHERE id_livro=?', [req.params.id], err => {
        if (err) return res.status(500).json({erro: err});
        res.json({mensagem: 'Livro eliminado'});
    });
});

// -------- AUTORES --------
app.get('/api/autores', (req, res) => {
    db.query('SELECT * FROM autores', (err, results) => {
        if (err) return res.status(500).json({erro: err});
        res.json(results);
    });
});

app.post('/api/autores', (req, res) => {
    const { nome, nacionalidade, data_nascimento } = req.body;
    db.query('INSERT INTO autores (nome_autor, nacionalidade, data_nascimento) VALUES (?, ?, ?)',
        [nome, nacionalidade, data_nascimento],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Autor adicionado'})
    );
});

app.put('/api/autores/:id', (req, res) => {
    const { nome, nacionalidade, data_nascimento } = req.body;
    db.query('UPDATE autores SET nome_autor=?, nacionalidade=?, data_nascimento=? WHERE id_autor=?',
        [nome, nacionalidade, data_nascimento, req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Autor atualizado'})
    );
});

app.delete('/api/autores/:id', (req, res) => {
    db.query('DELETE FROM autores WHERE id_autor=?', [req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Autor eliminado'})
    );
});

// -------- CATEGORIAS --------
app.get('/api/categorias', (req, res) => {
    db.query('SELECT * FROM categorias', (err, results) => {
        if (err) return res.status(500).json({erro: err});
        res.json(results);
    });
});

app.post('/api/categorias', (req, res) => {
    const { nome, descricao } = req.body;
    db.query('INSERT INTO categorias (nome_categoria, descricao) VALUES (?, ?)',
        [nome, descricao],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Categoria adicionada'})
    );
});

app.put('/api/categorias/:id', (req, res) => {
    const { nome, descricao } = req.body;
    db.query('UPDATE categorias SET nome_categoria=?, descricao=? WHERE id_categoria=?',
        [nome, descricao, req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Categoria atualizada'})
    );
});

app.delete('/api/categorias/:id', (req, res) => {
    db.query('DELETE FROM categorias WHERE id_categoria=?', [req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Categoria eliminada'})
    );
});

// -------- UTILIZADORES --------
app.get('/api/utilizadores', (req, res) => {
    db.query('SELECT * FROM utilizadores', (err, results) => {
        if (err) return res.status(500).json({erro: err});
        res.json(results);
    });
});

app.post('/api/utilizadores', (req, res) => {
    const { nome, email, tipo } = req.body;
    db.query('INSERT INTO utilizadores (nome, email, tipo) VALUES (?, ?, ?)',
        [nome, email, tipo],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Utilizador adicionado'})
    );
});

app.put('/api/utilizadores/:id', (req, res) => {
    const { nome, email, tipo } = req.body;
    db.query('UPDATE utilizadores SET nome=?, email=?, tipo=? WHERE id=?',
        [nome, email, tipo, req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Utilizador atualizado'})
    );
});

app.delete('/api/utilizadores/:id', (req, res) => {
    db.query('DELETE FROM utilizadores WHERE id=?', [req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Utilizador eliminado'})
    );
});

// -------- EMPRESTIMOS --------
app.get('/api/emprestimos', (req, res) => {
    db.query('SELECT * FROM emprestimos', (err, results) => {
        if (err) return res.status(500).json({erro: err});
        res.json(results);
    });
});

app.post('/api/emprestimos', (req, res) => {
    const { livro_id, utilizador_id, data_emprestimo, data_devolucao } = req.body;
    db.query('INSERT INTO emprestimos (livro_id, utilizador_id, data_emprestimo, data_devolucao) VALUES (?, ?, ?, ?)',
        [livro_id, utilizador_id, data_emprestimo, data_devolucao],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Empréstimo registado'})
    );
});

app.put('/api/emprestimos/:id', (req, res) => {
    const { livro_id, utilizador_id, data_emprestimo, data_devolucao } = req.body;
    db.query('UPDATE emprestimos SET livro_id=?, utilizador_id=?, data_emprestimo=?, data_devolucao=? WHERE id=?',
        [livro_id, utilizador_id, data_emprestimo, data_devolucao, req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Empréstimo atualizado'})
    );
});

app.delete('/api/emprestimos/:id', (req, res) => {
    db.query('DELETE FROM emprestimos WHERE id=?', [req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Empréstimo eliminado'})
    );
});

// -------- AVALIACOES --------
app.get('/api/avaliacoes', (req, res) => {
    db.query('SELECT * FROM avaliacoes', (err, results) => {
        if (err) return res.status(500).json({erro: err});
        res.json(results);
    });
});

app.post('/api/avaliacoes', (req, res) => {
    const { livro_id, utilizador_id, comentario, classificacao } = req.body;
    db.query('INSERT INTO avaliacoes (livro_id, utilizador_id, comentario, classificacao) VALUES (?, ?, ?, ?)',
        [livro_id, utilizador_id, comentario, classificacao],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Avaliação adicionada'})
    );
});

app.put('/api/avaliacoes/:id', (req, res) => {
    const { livro_id, utilizador_id, comentario, classificacao } = req.body;
    db.query('UPDATE avaliacoes SET livro_id=?, utilizador_id=?, comentario=?, classificacao=? WHERE id=?',
        [livro_id, utilizador_id, comentario, classificacao, req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Avaliação atualizada'})
    );
});

app.delete('/api/avaliacoes/:id', (req, res) => {
    db.query('DELETE FROM avaliacoes WHERE id=?', [req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Avaliação eliminada'})
    );
});

// ---- INICIAR SERVIDOR ----
app.listen(3000, () => console.log('🚀 Servidor ativo em http://localhost:3000'));
