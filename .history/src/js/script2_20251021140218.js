
// Arrays de dados
let dados = {
    livros: [],
    utilizadores: [],
    autores: [],
    categorias: [],
    emprestimos: [],
    avaliacoes: []
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
            document.getElementById(btn.dataset.section).classList.remove('hidden');
            carregarDados(btn.dataset.section);
        });
    });
});

// Função genérica para carregar dados
async function carregarDados(tipo) {
    try {
        const res = await fetch(`http://localhost:3000/api/${tipo}`);
        const dadosAPI = await res.json();
        dados[tipo] = dadosAPI;

        preencherTabela(tipo, dadosAPI);

        // Atualizar selects automaticamente
        switch (tipo) {
            case 'autores':
                preencherSelect('livro-autor_id', dadosAPI, 'id_autor', 'nome_autor', 'Selecione um autor');
                break;
            case 'categorias':
                preencherSelect('livro-categoria_id', dadosAPI, 'id_categoria', 'nome_categoria', 'Selecione uma categoria');
                break;
            case 'livros':
                const livrosDisponiveis = dadosAPI.filter(l => l.disponivel ===)
                preencherSelect('emprestimo-livro_id', dadosAPI, 'id_livro', 'titulo', 'Selecione um livro');
                preencherSelect('avaliacao-livro_id', dadosAPI, 'id_livro', 'titulo', 'Selecione um livro');
                break;
            case 'utilizadores':
                preencherSelect('emprestimo-utilizador_id', dadosAPI, 'id_utilizador', 'nome_utilizador', 'Selecione um utilizador');
                preencherSelect('avaliacao-utilizador_id', dadosAPI, 'id_utilizador', 'nome_utilizador', 'Selecione um utilizador');
                break;
        }
    } catch (error) {
        console.error(`Erro ao carregar ${tipo}:`, error);
    }
}

// Função genérica para preencher selects
function preencherSelect(selectId, dadosArray, idCampo, nomeCampo, textoDefault = 'Selecione') {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = `<option value="" selected>${textoDefault}</option>`;
    dadosArray.forEach(item => {
        const option = document.createElement('option');
        option.value = item[idCampo];
        option.textContent = item[nomeCampo];
        select.appendChild(option);
    });
}

// Função genérica para preencher tabelas
function preencherTabela(tipo, dadosArray) {
    const tbody = document.querySelector(`#tabela-${tipo} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';

    dadosArray.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = gerarLinha(tipo, item);
        tbody.appendChild(tr);
    });
}

// Função que gera HTML da linha da tabela
function gerarLinha(tipo, item) {
    const lookup = {
        livros: () => `
            <td>${item.titulo}</td>
            <td>${item.nome_autor || 'Desconhecido'}</td>
            <td>${item.nome_categoria || 'Desconhecida'}</td>
            <td>${item.ano}</td>
            <td>${item.disponivel ? 'Sim' : 'Não'}</td>
            <td class="actions">
                <button class="edit" onclick="editar('${tipo}', ${item.id_livro})">Editar</button>
                <button class="delete" onclick="deletar('${tipo}', ${item.id_livro})">Excluir</button>
            </td>
        `,
        autores: () => `
            <td>${item.nome_autor}</td>
            <td>${item.nacionalidade}</td>
            <td>${new Date(item.data_nascimento).toLocaleDateString('pt-PT')}</td>
            <td class="actions">
                <button class="edit" onclick="editar('autores', ${item.id_autor})">Editar</button>
                <button class="delete" onclick="deletar('autores', ${item.id_autor})">Excluir</button>
            </td>
        `,
        categorias: () => `
            <td>${item.nome_categoria}</td>
            <td>${item.descricao}</td>
            <td class="actions">
                <button class="edit" onclick="editar('categorias', ${item.id_categoria})">Editar</button>
                <button class="delete" onclick="deletar('categorias', ${item.id_categoria})">Excluir</button>
            </td>
        `,
        emprestimos: () => {
            return `
                <td>${item.titulo || 'Desconhecido'}</td>
                <td>${item.nome_utilizador || 'Desconhecido'}</td>
                <td>${new Date(item.data_emprestimo).toLocaleDateString('pt-PT')}</td>
                <td>${item.data_devolucao ? new Date(item.data_devolucao).toLocaleDateString('pt-PT') : 'Não devolvido'}</td>
                <td class="actions">
                    <button class="edit" onclick="editar('emprestimos', ${item.id_emprestimo})">Editar</button>
                    <button class="delete" onclick="deletar('emprestimos', ${item.id_emprestimo})">Excluir</button>
                </td>
            `;
        },
        avaliacoes: () => {
            return `
                <td>${item.titulo || 'Desconhecido'}</td>
                <td>${item.nome_utilizador || 'Desconhecido'}</td>
                <td>${item.comentario}</td>
                <td>${item.classificacao}</td>
                <td class="actions">
                    <button class="edit" onclick="editar('avaliacoes', ${item.id_avaliacao})">Editar</button>
                    <button class="delete" onclick="deletar('avaliacoes', ${item.id_avaliacao})">Excluir</button>
                </td>
            `;
        },
        utilizadores: () => `
            <td>${item.nome_utilizador}</td>
            <td>${item.email}</td>
            <td>${item.tipo}</td>
            <td class="actions">
                <button class="edit" onclick="editar('utilizadores', ${item.id_utilizador})">Editar</button>
                <button class="delete" onclick="deletar('utilizadores', ${item.id_utilizador})">Excluir</button>
            </td>
        `
    };

    return lookup[tipo] ? lookup[tipo]() : '';
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

// Animação de seções »»»
document.addEventListener('DOMContentLoaded', () => {
    carregarDados('autores');
    carregarDados('categorias');
    carregarDados('livros');
    carregarDados('utilizadores');
    carregarDados('emprestimos');
    carregarDados('avaliacoes');

    const sections = document.querySelectorAll('.nav-btn');
    sections.forEach(btn => {
        btn.addEventListener('click', () => {
            const allSections = document.querySelectorAll('.section');
            // esconde todas e remove 'visible' para permitir re-play da animação
            allSections.forEach(sec => {
                sec.classList.add('hidden');
                sec.classList.remove('visible');
            });

            const target = document.getElementById(btn.dataset.section);
            target.classList.remove('hidden');

            // forçar reflow / adicionar pequeno delay para que a transição seja aplicada novamente
            requestAnimationFrame(() => {
                setTimeout(() => target.classList.add('visible'), 50);
            });

            carregarDados('autores');
            carregarDados('categorias');
            carregarDados('livros');
            carregarDados('utilizadores');
            carregarDados('emprestimos');
            carregarDados('avaliacoes');
        });
    });
    
});


// Menu hamburguer
const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

if (hamburger && nav) {
    hamburger.addEventListener("click", () => nav.classList.toggle("active"));
}