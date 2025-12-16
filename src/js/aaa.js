function solicitarLivro(idLivro) {
    const livroDisponivel = dados.livros.find(l => l.id_livro === idLivro && l.disponivel === 1);
    if (!userLogado || livroDisponivel) {


        console.log('entrou');
        infoLivro.classList.remove('visible');
        infoLivro.classList.add('hidden');

        loginSection.classList.remove('hidden');
        loginSection.classList.add('visible');


    } else {
        if (!livroDisponivel) {
            abrirSecao('emprestimos');

        }
    }

}

// =======================
// BOTÃO SOLICITAR LIVRO
// =======================

const solicitarLivroBtn = document.getElementById('soliLivro');
const loginSection = document.getElementById('login-section');
const infoLivro = document.getElementById('infoLivro');

solicitarLivroBtn.addEventListener('click', () => {
    console.log(userLogado);
});

const popup = document.getElementById('meu-popup');
const abrirBtn = document.getElementById('abrir-popup');
const confirmacaoBtn = document.getElementById('confirmacao-popup'); // corrigido "cofirmacao"
const fecharBtn = document.getElementById('negacao-popup');

abrirBtn.addEventListener('click', () => {
    popup.style.display = 'flex';
    popup.showModal();
});

fecharBtn.addEventListener('click', () => {
    popup.close();
    popup.style.display = 'none';
});

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
                    dadosAPI = dadosAPI.filter(e => e.id_utilizador === userLogado.id_utilizador);
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