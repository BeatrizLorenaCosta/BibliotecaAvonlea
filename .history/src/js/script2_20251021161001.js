
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
                const livrosDisponiveis = dadosAPI.filter(l => l.disponivel === 1);
                preencherSelect('emprestimo-livro_id', livrosDisponiveis, 'id_livro', 'titulo', 'Selecione um livro');
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

// Função auxiliar para gerar estrelas (1 a 5)
function gerarEstrelas(qtd) {
    const total = 5;
    let estrelasHTML = '';
    for (let i = 1; i <= total; i++) {
        if (i <= qtd) {
            estrelasHTML += '<span class="estrela cheia">★</span>';
        } else {
            estrelasHTML += '<span class="estrela vazia">☆</span>';
        }
    }
    return estrelasHTML;
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
                <td>${gerarEstrelas(item.classificacao)}</td>
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
            <td>${item.livros_nao_devolvidos || 0}</td>
            <td class="actions">
                <button class="edit" onclick="editar('utilizadores', ${item.id_utilizador})">Editar</button>
                <button class="delete" onclick="deletar('utilizadores', ${item.id_utilizador})">Excluir</button>
            </td>
        `
    };

    return lookup[tipo] ? lookup[tipo]() : '';
}

// Função para mostrar mensagens na página
function mostrarMensagem(tipo, texto, sucesso = true) {
    const p = document.getElementById(`${tipo}-mensagem`);
    p.textContent = texto;
    p.className = `mensagem ${sucesso ? 'sucesso' : 'erro'}`;
    p.style.display = 'block';

    setTimeout(() => {
        p.style.display = 'none';
    }, 4000);
}


// Adicionar ou atualizar
function adicionarOuAtualizar(tipo) {
    const form = document.getElementById(`form-${tipo}`);
    const dados = {};
    let todosPreenchidos = true;

    form.querySelectorAll('input, select, textarea').forEach(el => {
        const campo = el.id.split('-')[1];

        if (el.type === 'checkbox') {
            dados[campo] = el.checked;
        } else {
            dados[campo] = el.value.trim(); // remove espaços em branco
            // verifica se o campo obrigatório está vazio
            if (el.hasAttribute('required') && dados[campo] === '') {
                todosPreenchidos = false;
            }
        }
    });

    if (!todosPreenchidos) {
        mostrarMensagem(tipo, "❌ Preencha todos os campos!", false);
        return; // não envia para o servidor
    }

    fetch(`http://localhost:3000/api/${tipo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(res => res.json())
    .then(data => {
        if (data.erro) {
            mostrarMensagem(tipo, "❌ Erro: " + (data.erro.sqlMessage || data.erro), false);
        } else {
            mostrarMensagem(tipo, "✅ " + (data.mensagem || "Ação realizada com sucesso!"), true);
            form.reset();
            carregarDados(tipo);
        }
    })
    .catch(err => mostrarMensagem(tipo, "❌ Erro de conexão com o servidor.", false));
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
        .then(res => res.json())
        .then(data => {
             if (data.erro) {
                mostrarMensagem(tipo, "❌ Erro: " + (data.erro.sqlMessage || data.erro), false);
            } else {
                mostrarMensagem(tipo, "🗑️ " + (data.mensagem || "Registo eliminado com sucesso."), true);
                carregarDados(tipo);
            }
        })
        .catch(err => mostrarMensagem(tipo, "❌ Erro de conexão com o servidor.", false));
    }
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


// Inicializa ordenação para todas as tabelas
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('table').forEach(tabela => {
        const ths = tabela.querySelectorAll('thead th');
        ths.forEach((th, indice) => {
            // Ignora a coluna "Ações"
            if (th.textContent.trim().toLowerCase() === 'ações') return;

            th.style.cursor = 'pointer';
            th.addEventListener('click', () => {
                const tipo = tabela.id.replace('tabela-', '');
                ordenarTabela(tipo, indice, th);
            });
        });
    });
});

// Função genérica para ordenar uma tabela
function ordenarTabela(tipo, indice, th) {
    const tabela = document.getElementById(`tabela-${tipo}`);
    const tbody = tabela.querySelector('tbody');
    const linhas = Array.from(tbody.querySelectorAll('tr'));

    // Alterna a direção (asc/desc)
    const asc = !th.classList.contains('asc');
    tabela.querySelectorAll('th').forEach(header => header.classList.remove('asc', 'desc'));
    th.classList.add(asc ? 'asc' : 'desc');

    linhas.sort((a, b) => {
        const valorA = a.children[indice].innerText.trim().toLowerCase();
        const valorB = b.children[indice].innerText.trim().toLowerCase();

        // Tenta converter para número ou data
        const numA = parseFloat(valorA.replace(',', '.'));
        const numB = parseFloat(valorB.replace(',', '.'));
        const dataA = Date.parse(valorA);
        const dataB = Date.parse(valorB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return asc ? numA - numB : numB - numA;
        } else if (!isNaN(dataA) && !isNaN(dataB)) {
            return asc ? dataA - dataB : dataB - dataA;
        } else {
            return asc ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        }
    });

    // Atualiza a tabela
    linhas.forEach(linha => tbody.appendChild(linha));
}

// Menu hamburguer
const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

if (hamburger && nav) {
    hamburger.addEventListener("click", () => nav.classList.toggle("active"));
}