
// Arrays de dados
let dados = {
    livros: [],
    utilizadores: [],
    autores: [],
    categorias: [],
    emprestimos: [],
    avaliacoes: []
};


let userLogado = null;
let idEmEdicao = null;

document.addEventListener('DOMContentLoaded', () => {

    // =======================
    // NAVEGAÇÃO ENTRE SEÇÕES
    // =======================
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const allSections = document.querySelectorAll('.section');
            allSections.forEach(sec => {
                sec.classList.add('hidden');
                sec.classList.remove('visible');
            });

            const target = document.getElementById(btn.dataset.section);
            target.classList.remove('hidden');

            // Animação
            requestAnimationFrame(() => {
                setTimeout(() => target.classList.add('visible'), 50);
            });

            carregarDados(btn.dataset.section);
            atualizarEstatisticas();

            // Atualiza classe active do menu
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // =======================
    // LOGIN
    // =======================
    const loginBtn = document.getElementById('login');
    loginBtn.addEventListener('click', () => {
        if (!userLogado) {
            navButtons.forEach(b => b.classList.remove('active'));
            loginBtn.classList.add('active');

            document.querySelectorAll('.section').forEach(sec => {
                sec.classList.add('hidden');
                sec.classList.remove('visible');
            });
            document.getElementById('login-section').classList.remove('hidden');
            requestAnimationFrame(() => {
                setTimeout(() => document.getElementById('login-section').classList.add('visible'), 50);
            });
        }
    });

    // =======================
    // LOGOUT
    // =======================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';

    // =======================
    // MENU HAMBURGUER
    // =======================
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('open');
        });
    }
    // =======================
    // TABELAS ORDENÁVEIS
    // =======================
    document.querySelectorAll('table').forEach(tabela => {
        const ths = tabela.querySelectorAll('thead th');
        ths.forEach((th, indice) => {
            if (th.textContent.trim().toLowerCase() === 'ações') return;
            th.style.cursor = 'pointer';
            th.addEventListener('click', () => {
                const tipo = tabela.id.replace('tabela-', '');
                ordenarTabela(tipo, indice, th);
            });
        });
    });

    // =======================
    // CARREGAR DADOS INICIAIS
    // =======================
    ['autores', 'categorias', 'livros', 'utilizadores', 'emprestimos', 'avaliacoes', 'reservas'].forEach(tipo => {
        carregarDados(tipo);
    });

    // =======================
    // ATUALIZAR ESTATÍSTICAS
    // =======================
    // atualizarEstatisticas();

    atualizarMenuPorTipo();
    atualizarPermissoesFormulario();

    // =======================
    // BOTÃO SOLICITAR LIVRO
    // =======================

    const solicitarLivroBtn = document.getElementById('soliLivro');

    solicitarLivroBtn.addEventListener('click', () => {
        console.log('Botão solicitar livro clicado. userLogado:', userLogado);
        const livroId = solicitarLivroBtn.dataset.livroId;
        solicitarLivro(livroId);
    });

    const popup = document.getElementById('meu-popup');
    const confirmacaoBtn = document.getElementById('confirmar-reserva');
    const fecharBtn = document.getElementById('cancelar-reserva');

    confirmacaoBtn.addEventListener('click', () => {
        const idLivro = popup.dataset.livroId;
        fazerReserva(idLivro);
        popup.close();
        // popup.style.display = 'none'; // Esconde o popup
    });

    fecharBtn.addEventListener('click', () => {
        popup.style.display = 'none'; // Esconde o popup
    });

    document.querySelectorAll('.redirect').forEach(element => {
        element.addEventListener('click', function () {
            const targetSection = this.dataset.section; // 'login' ou 'signup'

            // Esconde todas as secções
            document.querySelectorAll('.section').forEach(sec => {
                sec.classList.remove('visible');
                sec.classList.add('hidden');
            });

            // Mostra a secção correta com transição suave
            const target = document.getElementById(targetSection);
            target.classList.remove('hidden');

            requestAnimationFrame(() => {
                target.classList.add('visible');
            });

            // Atualiza o botão ativo no menu (se existir um botão para login/signup)
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Ativa o botão correspondente no menu
            const navButton = document.querySelector(`.nav-btn[data-section="${targetSection}"]`);
            if (navButton) {
                navButton.classList.add('active');
            }
        });
    });

});

function fazerReserva(idLivro) {
    fetch('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            livro_id: idLivro,
            utilizador_id: userLogado.id_utilizador
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                mostrarMensagem('reservas', "❌ Erro: " + (data.erro.sqlMessage || data.erro), false);
            } else {
                mostrarMensagem('reservas', "✅ Reserva realizada com sucesso!", true);
                carregarDados('reservas'); // Atualiza a tabela de reservas
                carregarDados('livros');   // Atualiza a tabela de livros
            }
        })
        .catch(err => mostrarMensagem('reservas', "❌ Erro de conexão com o servidor.", false));
}


// Função genérica para carregar dados
async function carregarDados(tipo) {
    try {
        const res = await fetch(`http://localhost:3000/api/${tipo}`);
        let dadosAPI = await res.json();

        // FILTRAR DADOS PARA USER COMUM
        if (userLogado && userLogado.tipo.toLowerCase() !== 'admin') {
            switch (tipo) {
                case 'emprestimos':
                    // só os empréstimos do próprio user
                    dadosAPI = dadosAPI.filter(e => e.utilizador_id === userLogado.id_utilizador);
                    break;
                case 'avaliacoes':
                    // avaliacoes do user sobre os livros que leu + todas as dos outros em todos os livros
                    dadosAPI = dadosAPI.map(av => {
                        if (av.id_utilizador === userLogado.id_utilizador) {
                            return av; // avaliacoes próprias
                        } else {
                            // aqui mostra todas as avaliacoes dos outros em todos os livros
                            return av;
                        }
                    });
                    break;
                case 'reservas':
                    dadosAPI = dadosAPI.filter(r => r.utilizador_id === userLogado.id_utilizador);
                    break;
                // livros e inicio permanecem completos
            }
        }

        dados[tipo] = dadosAPI;
        preencherTabela(tipo, dadosAPI);

        if (tipo === 'livros') {
            atualizarCapasLivros(dadosAPI);
        }


        // Atualizar selects
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

    if (tipo === 'livros') {
        dadosAPI.forEach(async livro => {
            const imgEl = document.getElementById(`capa-${livro.id_livro}`);
            if (!imgEl) return;

            const capa = await buscarCapaLivro(livro.titulo, livro.nome_autor);

            imgEl.src = capa || "placeholder.jpg";
        });
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

function preencherTabela(tipo, dadosArray) {
    const isAdmin = userLogado && userLogado.tipo.toLowerCase() === 'admin';

    // ==================== LIVROS (o teu código original, intocado) ====================
    if (tipo === 'livros') {
        const tabelaAdmin = document.getElementById('tabela-livros');
        const tabelaUser = document.getElementById('tabela-livros-user');

        const tbodyAdmin = tabelaAdmin.querySelector('tbody');
        const tbodyUser = tabelaUser ? tabelaUser.querySelector('tbody') : null;

        // Mostra a tabela correta
        tabelaAdmin.style.display = isAdmin ? 'table' : 'none';
        if (tabelaUser) tabelaUser.style.display = isAdmin ? 'none' : 'table';

        // Limpa
        tbodyAdmin.innerHTML = '';
        if (tbodyUser) tbodyUser.innerHTML = '';

        // Preenche a correta
        const tbodyCorreto = isAdmin ? tbodyAdmin : tbodyUser;

        dadosArray.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = gerarLinha(tipo, item, isAdmin);
            tbodyCorreto.appendChild(tr);
        });

        // Capas só para user comum
        if (!isAdmin && tabelaUser) {
            atualizarCapasLivros(dadosArray);
        }

        return; // sai aqui, não vai para baixo
    }

    // ==================== EMPRÉSTIMOS E RESERVAS (novo, separado) ====================
    if (tipo === 'emprestimos' || tipo === 'reservas') {
        let tabelaAdminId = tipo === 'emprestimos' ? 'tabela-emprestimos-admin' : 'tabela-reservas-admin';
        let tabelaUserId = tipo === 'emprestimos' ? 'tabela-emprestimos-user' : 'tabela-reservas-user';

        const tabelaAdmin = document.getElementById(tabelaAdminId);
        const tabelaUser = document.getElementById(tabelaUserId);

        if (!tabelaAdmin) return;

        const tbodyAdmin = tabelaAdmin.querySelector('tbody');
        const tbodyUser = tabelaUser ? tabelaUser.querySelector('tbody') : null;

        tabelaAdmin.style.display = isAdmin ? 'table' : 'none';
        if (tabelaUser) tabelaUser.style.display = isAdmin ? 'none' : 'table';

        tbodyAdmin.innerHTML = '';
        if (tbodyUser) tbodyUser.innerHTML = '';

        const tbodyCorreto = isAdmin ? tbodyAdmin : tbodyUser;

        dadosArray.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = gerarLinha(tipo, item);
            tbodyCorreto.appendChild(tr);
        });

        return;
    }

    // ==================== TODAS AS OUTRAS TABELAS ====================
    const tbody = document.querySelector(`#tabela-${tipo} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';
    dadosArray.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = gerarLinha(tipo, item);
        tbody.appendChild(tr);
    });
}

// Função para gerar estrelas, suporta meia estrela
function gerarEstrelas(qtd) {
    const total = 5;
    let estrelasHTML = '';
    for (let i = 1; i <= total; i++) {
        if (i <= Math.floor(qtd)) {
            estrelasHTML += '<span class="estrela cheia">★</span>';
        } else if (i === Math.floor(qtd) + 1 && qtd % 1 !== 0) {
            estrelasHTML += '<span class="estrela meia">⯪</span>';
        } else {
            estrelasHTML += '<span class="estrela vazia">☆</span>';
        }
    }
    return estrelasHTML;
}

// Função que gera HTML da linha da tabela
function gerarLinha(tipo, item, isAdmin = false) { // isAdmin agora é parâmetro opcional

    const lookup = {
        livros: () => {
            if (isAdmin) {
                return `
                    <td>${item.titulo || 'Desconhecido'}</td>
                    <td>${item.nome_autor || 'Desconhecido'}</td>
                    <td>${item.nome_categoria || 'Desconhecida'}</td>
                    <td>${item.ano || '-'}</td>
                    <td>${item.disponivel ? 'Sim' : 'Não'}</td>
                    <td>${gerarEstrelas(item.media_avaliacao || 0)}</td>
                    <td class="actions">
                        <button class="edit" onclick="editar('livros', ${item.id_livro})">Editar</button>
                        <button class="delete" onclick="deletar('livros', ${item.id_livro})">Excluir</button>
                    </td>
                `;
            } else {
                return `
                    <td class="capa">
                        <img id="capa-${item.id_livro}" src="placeholder.jpg" width="80" height="120" alt="Capa">
                        <br>
                        ${item.titulo || 'Desconhecido'}
                    </td
                    <td>${item.nome_autor || 'Desconhecido'}</td>
                    <td>${item.ano || 'Desconhecido'}</td>
                    <td class="actions">
                        <button class="edit" onclick="abrirSecaoComCapa('infoLivro', ${item.id_livro})">Ver Detalhes</button>
                    </td>
                `;
            }
        },

        autores: () => `
            <td>${item.nome_autor}</td>
            <td>${item.nacionalidade}</td>
            <td>${new Date(item.data_nascimento).toLocaleDateString('pt-PT')
            }</td >
    <td class="actions">
        <button class="edit" onclick="editar('autores', ${item.id_autor})">Editar</button>
        <button class="delete" onclick="deletar('autores', ${item.id_autor})">Excluir</button>
    </td>
`,
        categorias: () => `
    <td> ${item.nome_categoria}</td >
            <td>${item.descricao}</td>
            <td class="actions">
                <button class="edit" onclick="editar('categorias', ${item.id_categoria})">Editar</button>
                <button class="delete" onclick="deletar('categorias', ${item.id_categoria})">Excluir</button>
            </td>
`,
        emprestimos: () => {
            const isAdmin = userLogado && userLogado.tipo.toLowerCase() === 'admin';

            if (isAdmin) {
                return `
            <td>${item.nome_utilizador || 'Desconhecido'}</td>
            <td>${item.titulo || 'Desconhecido'}</td>
            <td>${item.data_emprestimo ? new Date(item.data_emprestimo).toLocaleDateString('pt-PT') : '-'}</td>
            <td>${item.data_devolucao ? new Date(item.data_devolucao).toLocaleDateString('pt-PT') : 'Não devolvido'}</td>
            <td>${item.status || 'Emprestado'}</td>
            <td class="actions">
                <button class="edit" onclick="editar('emprestimos', ${item.id_emprestimo})">Editar</button>
                <button class="delete" onclick="deletar('emprestimos', ${item.id_emprestimo})">Excluir</button>
            </td>
        `;
            } else {
                return `
            <td>${item.titulo || 'Desconhecido'}</td>
            <td>${item.data_devolucao ? new Date(item.data_devolucao).toLocaleDateString('pt-PT') : 'Não devolvido'}</td>
            <td>${item.status || 'Emprestado'}</td>
        `;
            }
        },

        reservas: () => {
            const isAdmin = userLogado && userLogado.tipo.toLowerCase() === 'admin';

            if (isAdmin) {
                // Usa valores com fallback seguro para evitar undefined/null
                const livroId = item.livro_id || item.id_livro || 0;
                const utilizadorId = item.utilizador_id || 0;
                const reservaId = item.id_reserva || 0;

                return `
            <td>${item.utilizador || item.nome_utilizador || 'Desconhecido'}</td>
            <td>${item.livro || item.titulo || 'Desconhecido'}</td>
            <td>${item.autor || 'Desconhecido'}</td>
            <td>${new Date(item.data_reserva).toLocaleDateString('pt-PT')}</td>
            <td>${item.status || 'Pendente'}</td>
            <td class="actions">
                <button class="edit" onclick="emprestarLivroComoAdmin(${livroId}, ${utilizadorId}, ${reservaId})">
                    Emprestar
                </button>
                <button class="delete" onclick="deletar('reservas', ${reservaId})">
                    Cancelar
                </button>
            </td>
        `;
            } else {
                // user comum
                const reservaId = item.id_reserva || 0;
                return `
            <td>${item.livro || item.titulo || 'Desconhecido'}</td>
            <td>${item.autor || 'Desconhecido'}</td>
            <td>${new Date(item.data_reserva).toLocaleDateString('pt-PT')}</td>
            <td>${item.status || 'Pendente'}</td>
            <td class="actions">
                <button class="delete" onclick="deletar('reservas', ${reservaId})">
                    Cancelar
                </button>
            </td>
        `;
            }
        },
        avaliacoes: () => {
            return `
    <td> ${item.titulo || 'Desconhecido'}
                <td>${item.nome_utilizador || 'Desconhecido'}</td>
                <td>${item.comentario}</td>
                <td>${gerarEstrelas(item.classificacao)}</td>
                <td class="actions">
                    <button class="delete" onclick="deletar('avaliacoes', ${item.id_avaliacao})">Excluir</button>
                </td>
`;
        },

        dadosLivro: () => {
            return `
    <td> ${item.titulo || 'Desconhecido'}</td >
                <td>${item.nome_autor || 'Desconhecido'}</td>
                <td>${item.nome_categoria || 'Desconhecido'}</td>
                <td>${item.disponivel ? 'Sim' : 'Não'}</td>
`;
        },

        utilizadores: () => `
    <td> ${item.nome_utilizador}</td >
            <td>${item.email}</td>
            <td>${item.tipo}</td>
            <td>${item.livros_emprestados || 0}</td>
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
    const p = document.getElementById(`${tipo} -mensagem`);
    p.textContent = texto;
    p.className = `mensagem ${sucesso ? 'sucesso' : 'erro'} `;
    p.style.display = 'block';

    setTimeout(() => {
        p.style.display = 'none';
    }, 4000);
}

// Adicionar ou atualizar
function adicionarOuAtualizar(tipo) {
    const form = document.getElementById(`form - ${tipo} `);
    const idInput = form.querySelector('input[type="hidden"]');
    const idExistente = idInput && idInput.value ? idInput.value : null;

    const dadosParaEnviar = {};
    let todosPreenchidos = true;

    form.querySelectorAll('input, select, textarea').forEach(el => {
        if (el === idInput) return;

        const sufixo = el.id.split('-')[1];

        let chaveAPI = sufixo;
        if (tipo === 'autores' && sufixo === 'nome') chaveAPI = 'nome_autor';
        if (tipo === 'categorias' && sufixo === 'nome') chaveAPI = 'nome_categoria';
        if (tipo === 'utilizadores' && sufixo === 'nome') chaveAPI = 'nome_utilizador';

        if (el.type === 'checkbox') {
            dadosParaEnviar[chaveAPI] = el.checked ? 1 : 0;
        } else {
            const valor = el.value.trim();
            dadosParaEnviar[chaveAPI] = valor;
            if (el.hasAttribute('required') && valor === '') {
                todosPreenchidos = false;
            }
        }
    });

    if (!todosPreenchidos) {
        mostrarMensagem(tipo, "❌ Preencha todos os campos obrigatórios!", false);
        return;
    }

    const metodo = idExistente ? 'PUT' : 'POST';
    const url = idExistente
        ? `http://localhost:3000/api/${tipo}/${idExistente}`
        : `http://localhost:3000/api/${tipo}`;

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar)
    })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                mostrarMensagem(tipo, "❌ Erro: " + (data.erro.sqlMessage || data.erro), false);
            } else {
                mostrarMensagem(
                    tipo,
                    idExistente ? "✅ Atualizado com sucesso!" : "✅ Guardado com sucesso!",
                    true
                );

                form.reset();
                if (idInput) idInput.value = '';
                const btn = form.querySelector('button[type="submit"], button');
                if (btn) btn.textContent = 'Adicionar';

                carregarDados(tipo);
            }
        })
        .catch(() => {
            mostrarMensagem(tipo, "❌ Erro de ligação ao servidor.", false);
        });
}

let autorEmEdicao = null;

// Editar
function editar(tipo, id) {
    const item = dados[tipo].find(el => {
        const chaveId = Object.keys(el).find(k => k.startsWith('id_'));
        return el[chaveId] == id;
    });

    if (!item) return;
    const mapaIds = {
        autores: 'autor-id',
        categorias: 'categoria-id',
        livros: 'livro-id',
        utilizadores: 'utilizador-id',
        avaliacoes: 'avaliacao-id',
        emprestimos: 'emprestimo-id',
        reservas: 'reserva-id'
    };
    const idInput = document.getElementById(mapaIds[tipo]);
    if (idInput) idInput.value = id;

    const form = document.getElementById(`form-${tipo}`);

    form.querySelectorAll('input, select, textarea').forEach(el => {
        const sufixo = el.id.split('-')[1];

        let chaveBD = sufixo;
        if (tipo === 'autores' && sufixo === 'nome') chaveBD = 'nome_autor';
        if (tipo === 'categorias' && sufixo === 'nome') chaveBD = 'nome_categoria';
        if (tipo === 'utilizadores' && sufixo === 'nome') chaveBD = 'nome_utilizador';

        const valor = item[chaveBD];

        if (valor !== undefined) {
            if (el.type === 'date') {
                el.value = new Date(valor).toISOString().split('T')[0];
            } else if (el.type === 'checkbox') {
                el.checked = !!valor;
            } else {
                el.value = valor;
            }
        }
    });

    const btn = form.querySelector('button[type="submit"], button');
    if (btn) btn.textContent = 'Alterar';
    form.scrollIntoView({ behavior: 'smooth' });
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

// Função para atualizar as estatísticas rápidas
function atualizarEstatisticas() {
    const metas = [
        { id: 'total-livros', endpoint: 'livros' },
        { id: 'total-utilizadores', endpoint: 'utilizadores' },
        { id: 'total-avaliacoes', endpoint: 'avaliacoes' }
    ];

    metas.forEach(meta => {
        const elemento = document.getElementById(meta.id);
        if (elemento) {
            fetch(`http://localhost:3000/api/${meta.endpoint}`)
                .then(res => res.json())
                .then(lista => {
                    elemento.textContent = lista.length;
                })
                .catch(err => console.warn(`Erro ao atualizar ${meta.id}:`, err));
        }
    });
}


async function fazerLogin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const erroMsg = document.getElementById('login-erro');

    try {
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await res.json();

        if (res.ok) {
            userLogado = data.user;
            erroMsg.style.display = 'none';
            alert(`Bem-vindo(a) ${userLogado.nome_utilizador} (${userLogado.tipo})`);

            atualizarMenuPorTipo();
            atualizarPermissoesFormulario();

            document.getElementById('login-section').classList.remove('visible');
            document.getElementById('login-section').classList.add('hidden');

            document.getElementById('login').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'block';

            document.getElementById('inicio').classList.remove('hidden');
            document.getElementById('inicio').classList.add('visible');

        } else {
            erroMsg.style.display = 'block';
            erroMsg.textContent = data.mensagem || 'Credenciais inválidas. Tente novamente.';
        }
    } catch (err) {
        console.error(err);
        erroMsg.style.display = 'block';
        erroMsg.textContent = 'Erro no servidor. Tente novamente mais tarde.';
    }
}

function criarConta() {
    // Pega os valores dos campos
    const nome = document.getElementById('criar-nome').value.trim();
    const email = document.getElementById('criar-email').value.trim();
    const senha = document.getElementById('criar-senha').value;

    // Pega o tipo selecionado (aluno ou professor)
    const tipoSelecionado = document.querySelector('input[name="tipo-utilizador"]:checked');

    // Validações básicas
    if (!nome) {
        alert('Por favor, insira o seu nome.');
        return;
    }

    if (!email) {
        alert('Por favor, insira o seu email.');
        return;
    }

    if (!senha) {
        alert('Por favor, insira uma senha.');
        return;
    }

    if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    if (!tipoSelecionado) {
        alert('Por favor, selecione se você é Aluno ou Professor.');
        return;
    }

    const tipo = tipoSelecionado.value; // "aluno" ou "professor"

    // Envia para o backend
    fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome_utilizador: nome,
            email: email,
            senha: senha,
            tipo: tipo
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.sucesso) {
                alert('✅ Conta criada com sucesso! Agora pode fazer login.');
                // Limpa o formulário
                document.querySelector('#sign-section form').reset();
                // Desmarca os radios (para limpar a seleção visual)
                document.querySelectorAll('input[name="tipo-utilizador"]').forEach(r => r.checked = false);
                // Volta para a tela de login
                abrirSecao('login-section');
            } else {
                alert('❌ Erro: ' + (data.mensagem || 'Não foi possível criar a conta.'));
            }
        })
        .catch(err => {
            console.error('Erro ao criar conta:', err);
            alert('❌ Erro de conexão com o servidor. Verifique se o backend está rodando.');
        });
}


function atualizarMenuPorTipo() {
    document.querySelectorAll('nav .nav-btn').forEach(btn => {
        const section = btn.dataset.section;

        if (btn.id === 'login') {
            // Botão login visível apenas se ninguém estiver logado
            btn.style.display = userLogado ? 'none' : 'inline-block';
            return;
        }

        if (btn.id === 'logout-btn') {
            // Botão logout visível apenas se alguém estiver logado
            btn.style.display = userLogado ? 'inline-block' : 'none';
            return;
        }

        if (!userLogado) {
            // Usuário convidado: só vê inicio, livros e avaliacoes
            if (['inicio', 'livros'].includes(section)) {
                btn.style.display = 'inline-block';
            } else {
                btn.style.display = 'none';
            }
            return;
        }

        // Usuário logado
        if (userLogado.tipo.toLowerCase() === 'admin') {
            btn.style.display = 'inline-block'; // admin vê tudo
        } else {
            // usuário comum
            if (['inicio', 'livros', 'emprestimos', 'reservas'].includes(section)) {
                btn.style.display = 'inline-block';
            } else {
                btn.style.display = 'none';
            }
        }
    });
}


function atualizarPermissoesFormulario() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        // Usuário não logado: esconde todos os forms de edição, mostra apenas login
        if (!userLogado) {
            if (form.id === 'form-login') {
                form.style.display = 'block';
            } else {
                form.style.display = 'none';
            }
        } else {
            // Usuário logado
            if (userLogado.tipo.toLowerCase() === 'admin') {
                form.style.display = 'block'; // admin vê todos os forms
            } else {
                // usuário normal não admin
                if (['form-avaliacoes'].includes(form.id)) {
                    form.style.display = 'block';
                } else {
                    form.style.display = 'none';
                }
            }
        }
    });
}

function sairLogin() {
    userLogado = null;
    alert('Sessão encerrada.');
    window.location.reload();
    // volta para a tela inicial ou login
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById('inicio').classList.remove('hidden');

    atualizarMenuPorTipo(); // atualiza visibilidade do menu
}

async function buscarCapaLivro(titulo, autor) {
    // Primeiro tenta Google Books
    try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(titulo)}+inauthor:${encodeURIComponent(autor)}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
            return data.items[0].volumeInfo.imageLinks.thumbnail;
        }
    } catch (e) { }

    // Depois tenta OpenLibrary
    try {
        const url2 = `https://openlibrary.org/search.json?title=${encodeURIComponent(titulo)}&author=${encodeURIComponent(autor)}`;
        const resp2 = await fetch(url2);
        const data2 = await resp2.json();

        if (data2.docs?.[0]?.cover_i) {
            return `https://covers.openlibrary.org/b/id/${data2.docs[0].cover_i}-M.jpg`;
        }
    } catch (e) { }

    return null; // Nenhuma capa encontrada
}

async function atualizarCapasLivros(livros) {
    for (const livro of livros) {
        const imgEl = document.getElementById(`capa-${livro.id_livro}`);
        if (!imgEl) continue;

        const capa = await buscarCapaLivro(livro.titulo, livro.nome_autor);
        imgEl.src = capa || "placeholder.jpg";
    }
}

function abrirSecao(secaoId, idLivro = null) {
    // Esconde todas as seções
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('visible');
    });

    // Mostra a seção desejada
    const secao = document.getElementById(secaoId);
    secao.classList.remove('hidden');
    requestAnimationFrame(() => {
        setTimeout(() => secao.classList.add('visible'), 50);
    });

    // Se passar um id de livro, carrega os dados
    if (idLivro) {
        preencherDadosLivro(idLivro);
        preencherAvaliacoesLivro(idLivro);
    }
}

async function preencherDadosLivro(idLivro) {
    const livro = dados.livros.find(l => l.id_livro === idLivro);
    if (!livro) return;

    const capaEl = document.querySelector('#infoLivro .capaLivro');
    const capa = await buscarCapaLivro(livro.titulo, livro.nome_autor);
    capaEl.style.backgroundImage = `url('${capa || "placeholder.jpg"}')`;

    const tabela = document.getElementById('tabela-dadosLivro');
    tabela.rows[0].cells[1].textContent = livro.titulo || 'Desconhecido';
    tabela.rows[1].cells[1].textContent = livro.nome_autor || 'Desconhecido';
    tabela.rows[2].cells[1].textContent = livro.nome_categoria || 'Desconhecida';
    tabela.rows[3].cells[1].textContent = livro.ano || '-';
    tabela.rows[4].cells[1].textContent = livro.disponivel ? 'Sim' : 'Não';

    // ✅ CORRIGIDO: NOME CERTO DA FUNÇÃO
    preencherMediaEAvaliacoes(idLivro);  // 🎯 MÉDIA + ESTRELAS

    // ✅ TABELA DE AVALIAÇÕES
    preencherAvaliacoesLivro(idLivro);

    const btnSolicitar = document.getElementById('soliLivro');
    btnSolicitar.dataset.livroId = idLivro;


}

function preencherMediaEAvaliacoes(idLivro) {
    const avaliacoes = dados.avaliacoes.filter(av => av.livro_id === idLivro);

    if (avaliacoes.length === 0) {
        document.getElementById('mediaAvaliacao').textContent = '0.0';
        document.getElementById('estrelasAvaliacao').innerHTML = '☆☆☆☆☆';
        return;
    }

    const soma = avaliacoes.reduce((total, av) => total + av.classificacao, 0);
    const media = (soma / avaliacoes.length).toFixed(1);

    document.getElementById('mediaAvaliacao').textContent = media;

    document.getElementById('estrelasAvaliacao').innerHTML = gerarEstrelas(media);
}

function preencherAvaliacoesLivro(idLivro) {

    const tbody = document.querySelector('#infoLivro #tabela-avaliacao tbody');
    tbody.innerHTML = ''; // Limpa

    // 🎯 Filtra avaliações pelo ID do livro
    const avaliacoesLivro = dados.avaliacoes.filter(av => av.livro_id === idLivro);

    if (avaliacoesLivro.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#888;">📝 Nenhuma avaliação ainda</td></tr>';
        return;
    }

    // 🎯 Preenche com os dados
    avaliacoesLivro.forEach(av => {
        tbody.innerHTML += `
            <tr>
                <td>${av.nome_utilizador || 'Anónimo'}</td>
                <td>${av.comentario || '-'}</td>
                <td>${gerarEstrelas(av.classificacao)}</td>
            </tr>
        `;
    });
}

async function abrirSecaoComCapa(secaoId, idLivro) {
    abrirSecao(secaoId); // Mostra a seção
    await preencherDadosLivro(idLivro); // Atualiza capa e tabela
    preencherAvaliacoesLivro(idLivro); // Atualiza avaliações
}

function solicitarLivro(idLivro) {
    idLivro = Number(idLivro);
    const livro = dados.livros.find(l => l.id_livro === idLivro);

    if (!livro) {
        console.error('Livro não encontrado:', idLivro);
        alert('Erro: livro não encontrado.');
        return;
    }

    // 1️⃣ Usuário não logado → redireciona para login
    if (!userLogado) {
        abrirSecao('login-section');
        return;
    }

    // 2️⃣ Livro disponível → faz empréstimo automático
    if (livro.disponivel === 1 || livro.disponivel === true) {
        fetch('http://localhost:3000/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                livro_id: idLivro,
                utilizador_id: userLogado.id_utilizador
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.erro) {
                    mostrarMensagem('reservas', "❌ Erro: " + (data.erro.sqlMessage || data.erro), false);
                } else {
                    alert("Livro reservado dirija se ao balcão para buscar");
                    carregarDados('reservas');
                    carregarDados('livros');
                }
            })
            .catch(err => mostrarMensagem('reservas', "Erro de conexão com o servidor.", false));
        return;
    }

    // 3️⃣ Livro indisponível → exibe popup de reserva
    const popup = document.getElementById('meu-popup');
    popup.dataset.livroId = idLivro;
    popup.style.display = 'block'; // Exibe o popup

}

function emprestarLivroComoAdmin(idLivro, idUtilizador, idReserva) {
    if (!confirm('Confirmar empréstimo deste livro para este utilizador?')) {
        return;
    }

    fetch('http://localhost:3000/api/emprestimos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            livro_id: idLivro,
            utilizador_id: idUtilizador,
            data_emprestimo: new Date().toISOString().slice(0, 10)
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert('❌ Erro ao realizar empréstimo: ' + (data.erro.sqlMessage || data.erro));
            } else {
                alert('✅ Empréstimo realizado com sucesso!\nO aluno pode ir buscar o livro.');

                // Atualiza tabelas
                carregarDados('emprestimos');
                carregarDados('livros');

                // === IMPORTANTE: Deleta a reserva após o empréstimo ===
                if (idReserva) {
                    fetch(`http://localhost:3000/api/reservas/${idReserva}`, {
                        method: 'DELETE'
                    })
                        .then(() => {
                            carregarDados('reservas'); // atualiza a tabela de reservas
                        })
                        .catch(err => console.error('Erro ao deletar reserva:', err));
                }
            }
        })
        .catch(err => {
            console.error(err);
            alert('❌ Erro de conexão com o servidor.');
        });
}




