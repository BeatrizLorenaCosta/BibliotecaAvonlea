const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

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

// Listar todos os autores
app.get('/api/autores', (req, res) => {
    db.query('SELECT * FROM autores', (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});

// Adicionar um autor
app.post('/api/autores', (req, res) => {
    const { nome_autor, nacionalidade, data_nascimento } = req.body;
    const dataNasc = new Date(data_nascimento).toISOString().slice(0, 10);

    db.query('INSERT INTO autores (nome_autor, nacionalidade, data_nascimento) VALUES (?, ?, ?)',
        [nome_autor, nacionalidade, dataNasc],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Autor adicionado' })
    );
});

// Atualizar um autor
app.put('/api/autores/:id', (req, res) => {
    const { nome_autor, nacionalidade, data_nascimento } = req.body;
    const dataNasc = new Date(data_nascimento).toISOString().slice(0, 10);

    db.query('UPDATE autores SET nome_autor=?, nacionalidade=?, data_nascimento=? WHERE id_autor=?',
        [nome_autor, nacionalidade, dataNasc, req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Autor atualizado' })
    );
});

// Deletar um autor
app.delete('/api/autores/:id', (req, res) => {
    db.query('DELETE FROM autores WHERE id_autor=?', [req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Autor eliminado' })
    );
});

// Listar todas as categorias
app.get('/api/categorias', (req, res) => {
    db.query('SELECT * FROM categorias', (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});

// Adicionar uma categoria
app.post('/api/categorias', (req, res) => {
    const { nome_categoria, descricao } = req.body;
    db.query('INSERT INTO categorias (nome_categoria, descricao) VALUES (?, ?)',
        [nome_categoria, descricao],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Categoria adicionada' })
    );
});

// Atualizar uma categoria
app.put('/api/categorias/:id', (req, res) => {
    const { nome_categoria, descricao } = req.body;
    db.query('UPDATE categorias SET nome_categoria=?, descricao=? WHERE id_categoria=?',
        [nome_categoria, descricao, req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Categoria atualizada' })
    );
});

// Deletar uma categoria
app.delete('/api/categorias/:id', (req, res) => {
    db.query('DELETE FROM categorias WHERE id_categoria=?', [req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Categoria eliminada' })
    );
});

// Listar todos os livros
app.get('/api/livros', (req, res) => {
    const sql = `
        SELECT
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
        GROUP BY l.id_livro, l.titulo, a.nome_autor, c.nome_categoria, l.ano, l.disponivel
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});

// Adicionar um livro
app.post('/api/livros', (req, res) => {
    const { titulo, autor_id, categoria_id, ano, disponivel } = req.body;
    db.query(
        'INSERT INTO livros (titulo, autor_id, categoria_id, ano, disponivel) VALUES (?, ?, ?, ?, ?)',
        [titulo, autor_id, categoria_id, ano, disponivel],
        err => {
            if (err) return res.status(500).json({ erro: err });
            res.json({ mensagem: '📚 Livro adicionado com sucesso!' });
        }
    );
});

// Atualizar um livro
app.put('/api/livros/:id', (req, res) => {
    const { titulo, autor_id, categoria_id, ano, disponivel } = req.body;
    db.query(
        'UPDATE livros SET titulo=?, autor_id=?, categoria_id=?, ano=?, disponivel=? WHERE id_livro=?',
        [titulo, autor_id, categoria_id, ano, disponivel, req.params.id],
        err => {
            if (err) return res.status(500).json({ erro: err });
            res.json({ mensagem: `Livro atualizado (id=${req.params.id})` });
        }
    );
});

// Deletar um livro
app.delete('/api/livros/:id', (req, res) => {
    db.query('DELETE FROM livros WHERE id_livro=?', [req.params.id], err => {
        if (err) return res.status(500).json({ erro: err });
        res.json({ mensagem: 'Livro eliminado' });
    });
});

// Listar todos os utilizadores
app.get('/api/utilizadores', (req, res) => {
    const sql = `
        SELECT
            u.id_utilizador,
            u.nome_utilizador,
            u.email,
            c.tipo,
            COUNT(e.id_emprestimo) AS livros_emprestados,
            SUM(CASE WHEN e.id_emprestimo IS NOT NULL AND e.data_devolucao IS NULL THEN 1 ELSE 0 END) AS livros_nao_devolvidos
        FROM utilizadores u
        JOIN contas c ON u.id_conta = c.id_conta
        LEFT JOIN emprestimos e ON u.id_utilizador = e.utilizador_id
        GROUP BY u.id_utilizador, c.tipo
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});

// Adicionar um utilizador
app.post('/api/utilizadores', (req, res) => {
    const { nome_utilizador, email, senha, id_conta } = req.body;
    db.query('INSERT INTO utilizadores (nome_utilizador, email, senha, id_conta) VALUES (?, ?, ?, ?)',
        [nome_utilizador, email, senha, id_conta],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Utilizador adicionado' })
    );
});

app.put('/api/utilizadores/:id', (req, res) => {
    const { nome_utilizador, email, senha, tipo } = req.body;

    // Monta a query dinamicamente
    let campos = [];
    let valores = [];

    if (tipo !== undefined) {
        // Busca id_conta pelo tipo
        db.query('SELECT id_conta FROM contas WHERE tipo = ?', [tipo], (err, results) => {
            if (err) return res.status(500).json({ erro: err });
            if (results.length === 0) return res.status(400).json({ erro: 'Tipo inválido' });

            const id_conta = results[0].id_conta;
            campos.push('id_conta = ?');
            valores.push(id_conta);

            if (nome_utilizador !== undefined) {
                campos.push('nome_utilizador = ?');
                valores.push(nome_utilizador);
            }

            if (email !== undefined) {
                campos.push('email = ?');
                valores.push(email);
            }

            if (senha !== undefined && senha !== '') {
                campos.push('senha = ?');
                valores.push(senha);
            }

            if (campos.length === 0) {
                return res.json({ mensagem: 'Nenhum campo para atualizar' });
            }

            valores.push(req.params.id); // para o WHERE

            const sql = `UPDATE utilizadores SET ${campos.join(', ')} WHERE id_utilizador = ?`;

            db.query(sql, valores, err => {
                if (err) return res.status(500).json({ erro: err });
                res.json({ mensagem: 'Utilizador atualizado com sucesso' });
            });
        });
    } else {
        return res.status(400).json({ erro: 'O campo tipo é obrigatório' });
    }
});
// Deletar um utilizador
app.delete('/api/utilizadores/:id', (req, res) => {
    db.query('DELETE FROM utilizadores WHERE id_utilizador=?', [req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Utilizador eliminado' })
    );
});

// ============ EMPRÉSTIMOS ============
app.get('/api/emprestimos', (req, res) => {
    const sql = `
        SELECT
            e.id_emprestimo,
            e.utilizador_id,      
            l.titulo,
            u.nome_utilizador,
            e.data_emprestimo,
            e.data_devolucao,
            e.status
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id_livro
        JOIN utilizadores u ON e.utilizador_id = u.id_utilizador
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});


app.post('/api/emprestimos', (req, res) => {
    const { livro_id, utilizador_id, data_emprestimo } = req.body;
    const dataEmp = new Date(data_emprestimo).toISOString().slice(0, 10);

    db.query(
        'INSERT INTO emprestimos (livro_id, utilizador_id, data_emprestimo, data_devolucao, status) VALUES (?, ?, ?, DATE_ADD(?, INTERVAL 30 DAY), "Emprestado")',
        [livro_id, utilizador_id, dataEmp, dataEmp],
        err => {
            if (err) return res.status(500).json({ erro: err });
            db.query('UPDATE livros SET disponivel = 0 WHERE id_livro = ?', [livro_id], err2 => {
                if (err2) return res.status(500).json({ erro: err2 });
                res.json({ mensagem: 'Empréstimo registrado e livro marcado como indisponível!' });
            });
        }
    );
});


app.put('/api/emprestimos/:id', (req, res) => {
    const { livro_id, utilizador_id, data_emprestimo, data_devolucao, status } = req.body;
    const dataEmp = new Date(data_emprestimo).toISOString().slice(0, 10);
    const dataDev = data_devolucao ? new Date(data_devolucao).toISOString().slice(0, 10) : null;

    db.query(
        'UPDATE emprestimos SET livro_id=?, utilizador_id=?, data_emprestimo=?, data_devolucao=?, status=? WHERE id_emprestimo=?',
        [livro_id, utilizador_id, dataEmp, dataDev, status, req.params.id],
        err => {
            if (err) return res.status(500).json({ erro: err });

            // Atualizar a disponibilidade do livro com base no status
            const disponivel = status === 'Devolvido' ? 1 : 0;
            db.query('UPDATE livros SET disponivel=? WHERE id_livro=?', [disponivel, livro_id], err2 => {
                if (err2) return res.status(500).json({ erro: err2 });
                res.json({ mensagem: `Empréstimo atualizado e livro marcado como ${status === 'Devolvido' ? 'disponível' : 'indisponível'}!` });
            });
        }
    );
});


app.delete('/api/emprestimos/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT livro_id, status FROM emprestimos WHERE id_emprestimo=?', [id], (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        if (results.length === 0) return res.status(404).json({ erro: 'Empréstimo não encontrado' });

        const { livro_id, status } = results[0];

        // Se o status for "Emprestado", marcar o livro como disponível ao deletar o empréstimo
        if (status === 'Emprestado') {
            db.query('UPDATE livros SET disponivel=1 WHERE id_livro=?', [livro_id], err => {
                if (err) return res.status(500).json({ erro: err });
                db.query('DELETE FROM emprestimos WHERE id_emprestimo=?', [id], err => {
                    if (err) return res.status(500).json({ erro: err });
                    res.json({ mensagem: 'Empréstimo eliminado e livro marcado como disponível!' });
                });
            });
        } else {
            db.query('DELETE FROM emprestimos WHERE id_emprestimo=?', [id], err => {
                if (err) return res.status(500).json({ erro: err });
                res.json({ mensagem: 'Empréstimo eliminado!' });
            });
        }
    });
});

// Listar todas as avaliações
app.get('/api/avaliacoes', (req, res) => {
    const sql = `
        SELECT
            a.id_avaliacao,
            a.livro_id,
            a.utilizador_id,
            a.comentario,
            a.classificacao,
            l.titulo,
            u.nome_utilizador
        FROM avaliacoes a
        JOIN livros l ON a.livro_id = l.id_livro
        JOIN utilizadores u ON a.utilizador_id = u.id_utilizador
        ORDER BY a.id_avaliacao DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});

// Adicionar uma avaliação
app.post('/api/avaliacoes', (req, res) => {
    const { livro_id, utilizador_id, comentario, classificacao } = req.body;
    db.query('INSERT INTO avaliacoes (livro_id, utilizador_id, comentario, classificacao) VALUES (?, ?, ?, ?)',
        [livro_id, utilizador_id, comentario, classificacao],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Avaliação adicionada' })
    );
});

// Atualizar uma avaliação
app.put('/api/avaliacoes/:id', (req, res) => {
    const { livro_id, utilizador_id, comentario, classificacao } = req.body;
    db.query('UPDATE avaliacoes SET livro_id=?, utilizador_id=?, comentario=?, classificacao=? WHERE id_avaliacao=?',
        [livro_id, utilizador_id, comentario, classificacao, req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Avaliação atualizada' })
    );
});

// Deletar uma avaliação
app.delete('/api/avaliacoes/:id', (req, res) => {
    db.query('DELETE FROM avaliacoes WHERE id_avaliacao=?', [req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Avaliação eliminada' })
    );
});

// ============ RESERVAS ============
app.get('/api/reservas', (req, res) => {
    const sql = `
        SELECT
            r.id_reserva,
            r.livro_id,        
            r.utilizador_id,           
            l.titulo AS livro,
            a.nome_autor AS autor,
            u.nome_utilizador AS utilizador,
            r.data_reserva,
            r.status
        FROM reservas r
        JOIN livros l ON r.livro_id = l.id_livro
        JOIN autores a ON l.autor_id = a.id_autor
        JOIN utilizadores u ON r.utilizador_id = u.id_utilizador
        ORDER BY r.data_reserva DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});

// Adicionar uma reserva
app.post('/api/reservas', (req, res) => {
    const { livro_id, utilizador_id } = req.body;
    db.query('INSERT INTO reservas (livro_id, utilizador_id, data_reserva, status) VALUES (?, ?, CURDATE(), "Pendente")',
        [livro_id, utilizador_id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Reserva adicionada' })
    );
});

// Atualizar uma reserva
app.put('/api/reservas/:id', (req, res) => {
    const { status } = req.body;
    db.query('UPDATE reservas SET status=? WHERE id_reserva=?',
        [status, req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Reserva atualizada' })
    );
});

// Deletar uma reserva
app.delete('/api/reservas/:id', (req, res) => {
    db.query('DELETE FROM reservas WHERE id_reserva=?', [req.params.id],
        err => err ? res.status(500).json({ erro: err }) : res.json({ mensagem: 'Reserva eliminada' })
    );
});

// Listar todas as contas
app.get('/api/contas', (req, res) => {
    db.query('SELECT * FROM contas', (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});

app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    const sql = 'SELECT u.id_utilizador, u.nome_utilizador, c.tipo FROM utilizadores u JOIN contas c ON u.id_conta = c.id_conta WHERE u.email = ? AND u.senha = ?';

    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: err });

        if (results.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
        }

        const user = results[0];
        res.json({ mensagem: 'Login efetuado com sucesso!', user });
    });
});

// ROTA PARA CRIAR CONTA (REGISTRO)
app.post('/api/registro', (req, res) => {
    const { nome_utilizador, email, senha, tipo } = req.body;

    if (!nome_utilizador || !email || !senha || !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    // Primeiro: verifica se o email já existe
    db.query('SELECT * FROM utilizadores WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        if (results.length > 0) {
            return res.status(400).json({ mensagem: 'Este email já está registrado' });
        }

        // Segundo: pega o id_conta correspondente ao tipo (aluno, professor, etc.)
        db.query('SELECT id_conta FROM contas WHERE tipo = ?', [tipo], (err, results) => {
            if (err) return res.status(500).json({ erro: err });
            if (results.length === 0) {
                return res.status(400).json({ mensagem: 'Tipo de utilizador inválido' });
            }

            const id_conta = results[0].id_conta;

            // Terceiro: insere o novo utilizador
            db.query(
                'INSERT INTO utilizadores (nome_utilizador, email, senha, id_conta) VALUES (?, ?, ?, ?)',
                [nome_utilizador, email, senha, id_conta],
                (err, result) => {
                    if (err) return res.status(500).json({ erro: err });
                    res.json({
                        sucesso: true,
                        mensagem: 'Conta criada com sucesso! Faça login para entrar.'
                    });
                }
            );
        });
    });
});

app.use(express.static('public'));
app.use('/src', express.static('src'));

app.listen(3000, () => console.log('🚀 Servidor ativo em http://localhost:3000'));
