/* Mysql connection and API routes
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
*/

// ===== Backend MySql

// Modernized script: fetch + async/await, event listeners, centralized handlers

const state = {current: 'livros'};

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

async function fetchJson(url, options = {}){
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.status === 204 ? null : res.json();
}

function showSection(sectionId){
    qsa('.section').forEach(s => s.classList.add('hidden'));
    const sec = document.getElementById(sectionId);
    if (sec) sec.classList.remove('hidden');
    state.current = sectionId;
    carregarDados(sectionId).catch(err => console.error('carregarDados:', err));
}

async function carregarDados(entidade){
    try{
        const dados = await fetchJson(`/api/${entidade}`);
        const tabelaBody = qs(`#tabela-${entidade} tbody`);
        tabelaBody.innerHTML = '';
        if (!Array.isArray(dados)) return;
        dados.forEach(item => tabelaBody.appendChild(rowFor(entidade, item)));
    }catch(err){
        console.error(err);
    }
}

function rowFor(entidade, item){
    const tr = document.createElement('tr');
    const make = colsFor(entidade, item);
    make.forEach(html => {
        const td = document.createElement('td');
        td.innerHTML = html;
        tr.appendChild(td);
    });
    const tdA = document.createElement('td');
    tdA.className = 'actions';
    const btnEdit = document.createElement('button'); btnEdit.className = 'edit'; btnEdit.textContent='Editar';
    btnEdit.addEventListener('click', () => editarItem(entidade, item));
    const btnDel = document.createElement('button'); btnDel.className = 'delete'; btnDel.textContent='Deletar';
    btnDel.addEventListener('click', () => deletarItem(entidade, item.id));
    tdA.append(btnEdit, btnDel);
    tr.appendChild(tdA);
    return tr;
}

function colsFor(entidade, item){
    if (entidade === 'livros') return [item.id, escapeHtml(item.titulo), item.autor_id, item.categoria_id, item.ano, item.disponivel ? 'Sim' : 'Não'].map(v=>`<span>${v}</span>`);
    if (entidade === 'autores') return [item.id, escapeHtml(item.nome), item.nacionalidade || '', item.data_nascimento || ''].map(v=>`<span>${v}</span>`);
    if (entidade === 'categorias') return [item.id, escapeHtml(item.nome), escapeHtml(item.descricao || '')].map(v=>`<span>${v}</span>`);
    if (entidade === 'utilizadores') return [item.id, escapeHtml(item.nome), escapeHtml(item.email), escapeHtml(item.tipo)].map(v=>`<span>${v}</span>`);
    if (entidade === 'emprestimos') return [item.id, item.livro_id, item.utilizador_id, item.data_emprestimo, item.data_devolucao || ''].map(v=>`<span>${v}</span>`);
    if (entidade === 'avaliacoes') return [item.id, item.livro_id, item.utilizador_id, escapeHtml(item.comentario || ''), item.classificacao].map(v=>`<span>${v}</span>`);
    return [item.id].map(v=>`<span>${v}</span>`);
}

function escapeHtml(s){ if (s==null) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }


/* adicionar ou atualizar com bd */

async function adicionarOuAtualizar(entidade){
    try{
        const id = qs(`#${entidade.slice(0,-1)}-id`).value;
        const dados = coletarDadosFormulario(entidade);
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `/api/${entidade}/${id}` : `/api/${entidade}`;
        await fetchJson(url, {method:metodo, headers:{'Content-Type':'application/json'}, body:JSON.stringify(dados)});
        limparFormulario(entidade);
        await carregarDados(entidade);
    }catch(err){
        console.error('save error', err);
        alert('Erro ao salvar. Veja console para detalhes.');
    }
}

async function deletarItem(entidade, id){
    if (!confirm('Confirmar deleção?')) return;
    try{
        await fetchJson(`/api/${entidade}/${id}`, {method:'DELETE'});
        await carregarDados(entidade);
    }catch(err){
        console.error('delete error', err);
        alert('Erro ao deletar. Veja console para detalhes.');
    }
}

function editarItem(entidade, item){
    qs(`#${entidade.slice(0,-1)}-id`).value = item.id;
    if (entidade === 'livros'){
        qs('#livro-titulo').value = item.titulo || '';
        qs('#livro-autor_id').value = item.autor_id || '';
        qs('#livro-categoria_id').value = item.categoria_id || '';
        qs('#livro-ano').value = item.ano || '';
        qs('#livro-disponivel').checked = !!item.disponivel;
    } else if (entidade === 'autores'){
        qs('#autor-nome').value = item.nome || '';
        qs('#autor-nacionalidade').value = item.nacionalidade || '';
        qs('#autor-data_nascimento').value = item.data_nascimento || '';
    } else if (entidade === 'categorias'){
        qs('#categoria-nome').value = item.nome || '';
        qs('#categoria-descricao').value = item.descricao || '';
    } else if (entidade === 'utilizadores'){
        qs('#utilizador-nome').value = item.nome || '';
        qs('#utilizador-email').value = item.email || '';
        qs('#utilizador-tipo').value = item.tipo || 'aluno';
    } else if (entidade === 'emprestimos'){
        qs('#emprestimo-livro_id').value = item.livro_id || '';
        qs('#emprestimo-utilizador_id').value = item.utilizador_id || '';
        qs('#emprestimo-data_emprestimo').value = item.data_emprestimo || '';
        qs('#emprestimo-data_devolucao').value = item.data_devolucao || '';
    } else if (entidade === 'avaliacoes'){
        qs('#avaliacao-livro_id').value = item.livro_id || '';
        qs('#avaliacao-utilizador_id').value = item.utilizador_id || '';
        qs('#avaliacao-comentario').value = item.comentario || '';
        qs('#avaliacao-classificacao').value = item.classificacao || '';
    }
}

function coletarDadosFormulario(entidade){
    if (entidade === 'livros') return {titulo:qs('#livro-titulo').value, autor_id: Number(qs('#livro-autor_id').value)||null, categoria_id: Number(qs('#livro-categoria_id').value)||null, ano: Number(qs('#livro-ano').value)||null, disponivel: !!qs('#livro-disponivel').checked };
    if (entidade === 'autores') return {nome:qs('#autor-nome').value, nacionalidade:qs('#autor-nacionalidade').value, data_nascimento:qs('#autor-data_nascimento').value };
    if (entidade === 'categorias') return {nome:qs('#categoria-nome').value, descricao:qs('#categoria-descricao').value };
    if (entidade === 'utilizadores') return {nome:qs('#utilizador-nome').value, email:qs('#utilizador-email').value, tipo:qs('#utilizador-tipo').value };
    if (entidade === 'emprestimos') return {livro_id: Number(qs('#emprestimo-livro_id').value)||null, utilizador_id: Number(qs('#emprestimo-utilizador_id').value)||null, data_emprestimo:qs('#emprestimo-data_emprestimo').value, data_devolucao:qs('#emprestimo-data_devolucao').value };
    if (entidade === 'avaliacoes') return {livro_id: Number(qs('#avaliacao-livro_id').value)||null, utilizador_id: Number(qs('#avaliacao-utilizador_id').value)||null, comentario:qs('#avaliacao-comentario').value, classificacao:Number(qs('#avaliacao-classificacao').value)||null };
    return {};
}

function limparFormulario(entidade){
    const form = qs(`#form-${entidade}`);
    if (form) form.reset();
    const id = qs(`#${entidade.slice(0,-1)}-id`);
    if (id) id.value = '';
}

// Wire up nav & form buttons
function init(){
    qsa('.nav-btn').forEach(btn => btn.addEventListener('click', e => showSection(btn.dataset.section)));
    // submit buttons
    qsa('.submit-btn').forEach(b => b.addEventListener('click', e => adicionarOuAtualizar(b.dataset.entity)));
    qsa('.reset-btn').forEach(b => b.addEventListener('click', e => limparFormulario(b.dataset.entity)));
    // initial load
    showSection('livros');
}

document.addEventListener('DOMContentLoaded', init);