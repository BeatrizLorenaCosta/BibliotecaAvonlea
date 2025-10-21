
let livros = [];
let utilizadores = [];
let autores = [];
let categorias = [];
let emprestimos = [];
let avaliacoes = [];

const dependencias = {
    livros: ['autores', 'categorias'],
    emprestimos: ['livros', 'utilizadores'],
    avaliacoes: ['livros', 'utilizadores'],
};

const selects = {
    'livro-autor_id': 'autores',
    'livro-categoria_id': 'categorias',
    'emprestimo-livro_id': 'livros',
    'emprestimo-utilizador_id': 'utilizadores',
    'avaliacao-livro_id': 'livros',
    'avaliacao-utilizador_id': 'utilizadores'
};


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
            window[tipo] = dados; // livros, autores, etc.

            preencherTabela(tipo, dados);

            // Preencher selects
            for (let selectId in selects) {
                if (selects[selectId] === tipo) {
                    const item = dados[0];
                    const idCampo = Object.keys(item).find(k => k.includes('id'));
                    const nomeCampo = Object.keys(item).find(k => k.includes('nome') || k.includes('titulo'));
                    preencherSelect(selectId, dados, idCampo, nomeCampo);
                }
            }

            // Atualizar tabelas dependentes
            if (dependencias[tipo]) {
                dependencias[tipo].forEach(dep => {
                    if (!document.getElementById(dep).classList.contains('hidden')) {
                        preencherTabela(dep, window[dep]);
                    }
                });
            }
        });
}

function preencherSelect(selectId, dados, idCampo, nomeCampo) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Mapa com mensagens amigáveis para cada select
    const mensagens = {
        'livro-autor_id': 'Selecione um autor',
        'livro-categoria_id': 'Selecione uma categoria',
        'emprestimo-livro_id': 'Selecione um livro',
        'emprestimo-utilizador_id': 'Selecione um utilizador',
        'avaliacao-livro_id': 'Selecione um livro',
        'avaliacao-utilizador_id': 'Selecione um utilizador'
    };

    // Define a opção padrão
    const defaultText = mensagens[selectId] || 'Selecione uma opção';
    select.innerHTML = `<option value="" selected>${defaultText}</option>`;

    // Preenche o restante
    dados.forEach(item => {
        const option = document.createElement('option');
        option.value = item[idCampo];
        option.textContent = item[nomeCampo];
        select.appendChild(option);
    });
}


const templates = {
    livros: (item) => {
        const autor = autores.find(a => a.id_autor === item.autor_id); 
        const categoria = categorias.find(c => c.id_categoria === item.categoria_id);
        return `
            <td>${item.titulo}</td>
            <td>${autor ? autor.nome_autor : 'Desconhecido'}</td>
            <td>${categoria ? categoria.nome_categoria : 'Desconhecida'}</td>
            <td>${item.ano}</td>
            <td>${item.disponivel ? 'Sim' : 'Não'}</td>
            <td class="actions">
                <button class="edit" onclick="editar('livros', ${item.id_livro})">Editar</button>
                <button class="delete" onclick="deletar('livros', ${item.id_livro})">Excluir</button>
            </td>
        `;
    },
    autores: (item) => `
        <td>${item.nome_autor}</td>
        <td>${item.nacionalidade}</td>
        <td>${new Date(item.data_nascimento).toLocaleDateString('pt-BR')}</td>
        <td class="actions">
            <button class="edit" onclick="editar('autores', ${item.id_autor})">Editar</button>
            <button class="delete" onclick="deletar('autores', ${item.id_autor})">Excluir</button>
        </td>
    `,
    categorias: (item) => `
        <td>${item.nome_categoria}</td>
        <td>${item.descricao}</td>
        <td class="actions">
            <button class="edit" onclick="editar('categorias', ${item.id_categoria})">Editar</button>
            <button class="delete" onclick="deletar('categorias', ${item.id_categoria})">Excluir</button>
        </td>
    `,
    emprestimos: (item) => {
        const livro = livros.find(l => l.id_livro === item.livro_id)?.titulo || 'Desconhecido';
        const utilizador = utilizadores.find(u => u.id_utilizador === item.utilizador_id)?.nome_utilizador || 'Desconhecido';
        return `
            <td>${livro}</td>
            <td>${utilizador}</td>
            <td>${new Date(item.data_emprestimo).toLocaleDateString('pt-BR')}</td>
            <td>${item.data_devolucao ? new Date(item.data_devolucao).toLocaleDateString('pt-BR') : 'Não devolvido'}</td>
            <td class="actions">
                <button class="edit" onclick="editar('emprestimos', ${item.id_emprestimo})">Editar</button>
                <button class="delete" onclick="deletar('emprestimos', ${item.id_emprestimo})">Excluir</button>
            </td>
        `;
    },
    avaliacoes: (item) => {
        const livro = livros.find(l => l.id_livro === item.livro_id)?.titulo || 'Desconhecido';
        const utilizador = utilizadores.find(u => u.id_utilizador === item.utilizador_id)?.nome_utilizador || 'Desconhecido';
        return `
            <td>${livro}</td>
            <td>${utilizador}</td>
            <td>${item.comentario}</td>
            <td>${item.classificacao}</td>
            <td class="actions">
                <button class="edit" onclick="editar('avaliacoes', ${item.id_avaliacao})">Editar</button>
                <button class="delete" onclick="deletar('avaliacoes', ${item.id_avaliacao})">Excluir</button>
            </td>
        `;
    },
    utilizadores: (item) => `
        <td>${item.nome_utilizador}</td>
        <td>${item.email}</td>
        <td>${item.tipo}</td>
        <td class="actions">
            <button class="edit" onclick="editar('utilizadores', ${item.id_utilizador})">Editar</button>
            <button class="delete" onclick="deletar('utilizadores', ${item.id_utilizador})">Excluir</button>
        </td>
    `,
};

// Preencher tabela

function preencherTabela(tipo, dados) {
    const tbody = document.querySelector(`#tabela-${tipo} tbody`);
    tbody.innerHTML = '';
    dados.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = templates[tipo](item);
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