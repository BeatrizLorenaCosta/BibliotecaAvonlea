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
    db.query('SELECT 
            l.id_livro,
            l.titulo,
            a.nome_autor,
            c.nome_categoria,
            l.ano,
            l.disponivel,
            ROUND(AVG(av.classificacao), 2) AS media_avaliacao
        FROM livros l
        JOIN autores a ON l.autor_id = a.id_autor
        JOIN categorias c ON l.categoria_id = c.id_categoria
        LEFT JOIN avaliacoes av ON l.id_livro = av.livro_id
        GROUP BY l.id_livro, l.titulo, a.nome_autor, c.nome_categoria, l.ano, l.disponivel', (err, results) => {
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

    // Converte para formato YYYY-MM-DD
    const dataNasc = new Date(data_nascimento).toISOString().slice(0, 10);

    db.query('INSERT INTO autores (nome_autor, nacionalidade, data_nascimento) VALUES (?, ?, ?)',
        [nome, nacionalidade, dataNasc],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Autor adicionado'})
    );
});

app.put('/api/autores/:id', (req, res) => {
    const { nome, nacionalidade, data_nascimento } = req.body;

    // Converte para formato YYYY-MM-DD
    const dataNasc = new Date(data_nascimento).toISOString().slice(0, 10);

    db.query('UPDATE autores SET nome_autor=?, nacionalidade=?, data_nascimento=? WHERE id_autor=?',
        [nome, nacionalidade, dataNasc, req.params.id],
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
        if (err) return res.status(500).json({ erro: err });
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
    const sql = `
        SELECT u.*, 
            COUNT(e.id_emprestimo) AS livros_emprestados,
            SUM(CASE WHEN e.id_emprestimo IS NOT NULL AND e.data_devolucao IS NULL THEN 1 ELSE 0 END) AS livros_nao_devolvidos
        FROM utilizadores u
        LEFT JOIN emprestimos e ON u.id_utilizador = e.utilizador_id
        GROUP BY u.id_utilizador
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});


app.post('/api/utilizadores', (req, res) => {
    const { nome, email, tipo } = req.body;
    db.query('INSERT INTO utilizadores (nome_utilizador, email, tipo) VALUES (?, ?, ?)',
        [nome, email, tipo],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Utilizador adicionado'})
    );
});

app.put('/api/utilizadores/:id', (req, res) => {
    const { nome, email, tipo } = req.body;
    db.query('UPDATE utilizadores SET nome_utilizador=?, email=?, tipo=? WHERE id_utilizador=?',
        [nome, email, tipo, req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Utilizador atualizado'})
    );
});

app.delete('/api/utilizadores/:id', (req, res) => {
    db.query('DELETE FROM utilizadores WHERE id_utilizador=?', [req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Utilizador eliminado'})
    );
});

// -------- EMPRESTIMOS --------
app.get('/api/emprestimos', (req, res) => {
    db.query('SELECT e.id_emprestimo, l.titulo, u.nome_utilizador, e.data_emprestimo, e.data_devolucao FROM emprestimos e JOIN livros l ON e.livro_id = l.id_livro JOIN utilizadores u ON e.utilizador_id = u.id_utilizador', (err, results) => {
        if (err) return res.status(500).json({erro: err});
        res.json(results);
    });
});

// -------- EMPRESTIMOS --------
app.post('/api/emprestimos', (req, res) => {
    const { livro_id, utilizador_id, data_emprestimo, data_devolucao } = req.body;

    // Converte para formato YYYY-MM-DD
    const dataEmp = new Date(data_emprestimo).toISOString().slice(0, 10);
    const dataDev = data_devolucao ? new Date(data_devolucao).toISOString().slice(0, 10) : null;

    // Inserir empréstimo
    db.query(
        'INSERT INTO emprestimos (livro_id, utilizador_id, data_emprestimo, data_devolucao) VALUES (?, ?, ?, ?)',
        [livro_id, utilizador_id, dataEmp, dataDev],
        err => {
            if (err) return res.status(500).json({ erro: err });

            // Só marcar como indisponível se não houver data de devolução
            if (!dataDev) {
                db.query(
                    'UPDATE livros SET disponivel = 0 WHERE id_livro = ?',
                    [livro_id],
                    err2 => {
                        if (err2) return res.status(500).json({ erro: err2 });
                        res.json({ mensagem: 'Empréstimo registado e livro marcado como indisponível!' });
                    }
                );
            } else {
                res.json({ mensagem: 'Empréstimo registado!' });
            }
        }
    );
});


app.put('/api/emprestimos/:id', (req, res) => {
    const { livro_id, utilizador_id, data_emprestimo, data_devolucao } = req.body;

    const dataEmp = new Date(data_emprestimo).toISOString().slice(0, 10);
    const dataDev = data_devolucao ? new Date(data_devolucao).toISOString().slice(0, 10) : null;

    db.query(
        'UPDATE emprestimos SET livro_id=?, utilizador_id=?, data_emprestimo=?, data_devolucao=? WHERE id_emprestimo=?',
        [livro_id, utilizador_id, dataEmp, dataDev, req.params.id],
        err => {
            if (err) return res.status(500).json({ erro: err });

            // Se houver data de devolução, marca livro como disponível
            if (dataDev) {
                db.query(
                    'UPDATE livros SET disponivel = ? WHERE id_livro = ?',
                    [true, livro_id],
                    err2 => {
                        if (err2) return res.status(500).json({ erro: err2 });
                        res.json({ mensagem: 'Empréstimo atualizado e livro devolvido!' });
                    }
                );
            } else {
                res.json({ mensagem: 'Empréstimo atualizado!' });
            }
        }
    );
});

app.delete('/api/emprestimos/:id', (req, res) => {
    const id = req.params.id;

    // 1️⃣ Obter o livro_id do empréstimo
    db.query('SELECT livro_id FROM emprestimos WHERE id_emprestimo=?', [id], (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        if (results.length === 0) return res.status(404).json({ erro: 'Empréstimo não encontrado' });

        const livro_id = results[0].livro_id;

        // 2️⃣ Atualizar o livro para disponível
        db.query('UPDATE livros SET disponivel=TRUE WHERE id_livro=?', [livro_id], (err) => {
            if (err) return res.status(500).json({ erro: err });

            // 3️⃣ Eliminar o empréstimo
            db.query('DELETE FROM emprestimos WHERE id_emprestimo=?', [id], (err) => {
                if (err) return res.status(500).json({ erro: err });
                res.json({ mensagem: 'Empréstimo eliminado e livro disponível atualizado' });
            });
        });
    });
});


// -------- AVALIACOES --------
app.get('/api/avaliacoes', (req, res) => {
    db.query('SELECT a.id_avaliacao, l.titulo, u.nome_utilizador, a.comentario, a.classificacao FROM avaliacoes a JOIN livros l ON a.livro_id = l.id_livro JOIN utilizadores u ON a.utilizador_id = u.id_utilizador', (err, results) => {
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
    db.query('UPDATE avaliacoes SET livro_id=?, utilizador_id=?, comentario=?, classificacao=? WHERE id_avaliacao=?',
        [livro_id, utilizador_id, comentario, classificacao, req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Avaliação atualizada'})
    );
});

app.delete('/api/avaliacoes/:id', (req, res) => {
    db.query('DELETE FROM avaliacoes WHERE id_avaliacao=?', [req.params.id],
        err => err ? res.status(500).json({erro: err}) : res.json({mensagem:'Avaliação eliminada'})
    );
});

// ---- CONTAS ----
app.get('/api/contas', (req, res) => {
    db.query('SELECT * FROM contas', (err, results) => {
        if (err) return res.status(500).json({erro: err});
        res.json(results);
    });
});

// ---- INICIAR SERVIDOR ----
// Servir o HTML principal
app.use(express.static('public'));
// Servir os recursos (CSS, JS, imagens, etc.)
app.use('/src', express.static('src'));
// Iniciar o servidor
app.listen(3000, () => console.log('🚀 Servidor ativo em http://localhost:3000'));
