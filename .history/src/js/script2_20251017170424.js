
let livros = [];
let utilizadores = [];
let autores = [];
let categorias = [];
let emprestimos = [];
let avaliacoes = [];


document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.nav-btn');
    sections.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
            document.getElementById(btn.dataset.section).classList.remove('hidden');
            carregarDados('autores');
            carregarDados('categorias');
            carregarDados('livros');
            carregarDados('utilizadores');
            carregarDados('emprestimos');
            carregarDados('avaliacoes');
        });
    });

    
});

// Função genérica para carregar dados
function carregarDados(tipo) {
    fetch(`http://localhost:3000/api/${tipo}`)
        .then(res => res.json())
        .then(dados => {
            if (tipo === 'autores') {
                autores = dados;
                preencherSelect('livro-autor_id', dados, 'id_autor', 'nome_autor');
                // se esta section livros
                if (!document.getElementById('livros').classList.contains('hidden')) {
                    preencherTabela(tipo, dados);
                }
                
            } else if (tipo === 'categorias') {
                categorias = dados;
                preencherSelect('livro-categoria_id', dados, 'id_categoria', 'nome_categoria');
                if (!document.getElementById('livros').classList.contains('hidden')) {
                    preencherTabela(tipo, dados);
                }
            } else if (tipo === 'livros') {
                livros = dados;
                preencherTabela(tipo, dados);
            } else if (tipo === 'utilizadores') {
                utilizadores = dados;
                preencherTabela(tipo, dados);
            } else if (tipo === 'emprestimos') {
                emprestimos = dados;
                preencherTabela(tipo, dados);
            } else if (tipo === 'avaliacoes') {
                avaliacoes = dados;
                preencherTabela(tipo, dados);
            }
        });
}

function preencherSelect(selectId, dados, idCampo, nomeCampo) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Mantém o primeiro option "Selecione..."
    if (idCampo == 'id_autor')
        select.innerHTML = '<option value="" selected>Selecione um autor</option>';
    else if (idCampo == 'id_categoria')
        select.innerHTML = '<option value="" selected>Selecione uma categoria</option>';

    dados.forEach(item => {
        const option = document.createElement('option');
        option.value = item[idCampo];
        option.textContent = item[nomeCampo];
        select.appendChild(option);
    });
}

// Preencher tabela

function preencherTabela(tipo, dados) {
    const tbody = document.querySelector(`#tabela-${tipo} tbody`);
    tbody.innerHTML = '';

    dados.forEach(item => {
        const tr = document.createElement('tr');

        if (tipo === 'livros') {
            const autor = autores.find(a => a.id_autor === item.autor_id);
            const categoria = categorias.find(c => c.id_categoria === item.categoria_id);

            tr.innerHTML = `
                <td>${item.titulo}</td>
                <td>${autor ? autor.nome_autor : 'Desconhecido'}</td>
                <td>${categoria ? categoria.nome_categoria : 'Desconhecida'}</td>
                <td>${item.ano}</td>
                <td>${item.disponivel ? 'Sim' : 'Não'}</td>
                <td class="actions">
                    <button class="edit" onclick="editar('${tipo}', ${item.id_livro})">Editar</button>
                    <button class="delete" onclick="deletar('${tipo}', ${item.id_livro})">Excluir</button>
                </td>
            `;
        } else if (tipo === 'emprestimos') {
            const livro = livros.find(l => l.id_livro === item.livro_id);
            const utilizador = utilizadores.find(u => u.id_utilizador === item.utilizador_id);

            tr.innerHTML = `
                    <td>${livro ? livro.titulo : 'Desconhecido'}</td>
                    <td>${utilizador ? utilizador.nome_utilizador : 'Desconhecido'}</td>
                    <td>${new Date(item.data_emprestimo).toLocaleDateString('pt-BR')}</td>
                    <td>${item.data_devolucao ? new Date(item.data_devolucao).toLocaleDateString('pt-BR') : ''}</td>
                    <td class="actions">
                        <button class="edit" onclick="editar('emprestimos', ${item.id})">Editar</button>
                        <button class="delete" onclick="deletar('emprestimos', ${item.id})">Excluir</button>
                    </td>
                `;

        } else if (tipo === 'avaliacoes') {
            const livro = livros.find(l => l.id_livro === item.livro_id);
            const utilizador = utilizadores.find(u => u.id_utilizador === item.utilizador_id);
            tr.innerHTML = `
                <td>${livro ? livro.titulo : 'Desconhecido'}</td>
                <td>${utilizador ? utilizador.nome_utilizador : 'Desconhecido'}</td>
                
                <td>${item.comentario}</td>
                <td class="actions">
                    <button class="edit" onclick="editar('avaliacoes', ${item.id})">Editar</button>
                    <button class="delete" onclick="deletar('avaliacoes', ${item.id})">Excluir</button>
                </td>
            `;
        } else {
            Object.values(item).forEach(valor => {
                const td = document.createElement('td');
                td.textContent = valor;
                tr.appendChild(td);
            });

            const tdAcoes = document.createElement('td');
            tdAcoes.classList.add('actions');
            tdAcoes.innerHTML = `
                <button class="edit" onclick="editar('${tipo}', ${item.id})">Editar</button>
                <button class="delete" onclick="deletar('${tipo}', ${item.id})">Excluir</button>
            `;
            tr.appendChild(tdAcoes);
        }

        tbody.appendChild(tr);
    });
}


// Adicionar ou atualizar
function adicionarOuAtualizar(tipo) {
    const form = document.getElementById(`form-${tipo}`);
    const dados = {};
    form.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.type === 'checkbox') {
            dados[el.id.split('-')[1]] = el.checked;
        } else {
            dados[el.id.split('-')[1]] = el.value;
        }
    });

    fetch(`http://localhost:3000/api/${tipo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        form.reset();
        carregarDados(tipo);
    });
}

// Editar
function editar(tipo, id) {
    fetch(`http://localhost:3000/api/${tipo}`)
        .then(res => res.json())
        .then(dados => {
            const item = dados.find(el => el.id === id);
            const form = document.getElementById(`form-${tipo}`);
            form.querySelectorAll('input, select, textarea').forEach(el => {
                const campo = el.id.split('-')[1];
                if (el.type === 'checkbox') {
                    el.checked = item[campo];
                } else {
                    el.value = item[campo];
                }
            });
        });
}

// Deletar
function deletar(tipo, id) {
    if (confirm('Tem certeza que deseja excluir?')) {
        fetch(`http://localhost:3000/api/${tipo}/${id}`, {
            method: 'DELETE'
        })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            carregarDados(tipo);
        });
    }
}

// Carregar autores e categorias nos selects
function carregarSelects() {
    fetch('http://localhost:3000/api/autores')
        .then(res => res.json())
        .then(autores => {
            const selectAutor = document.getElementById('livro-autor_id');
            selectAutor.innerHTML = '';
            autores.forEach(autor => {
                const option = document.createElement('option');
                option.value = autor.id;
                option.textContent = autor.nome;
                selectAutor.appendChild(option);
            });
        });

    fetch('http://localhost:3000/api/categorias')
        .then(res => res.json())
        .then(categorias => {
            const selectCategoria = document.getElementById('livro-categoria_id');
            selectCategoria.innerHTML = '';
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nome;
                selectCategoria.appendChild(option);
            });
        });
}