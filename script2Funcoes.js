// Função que gera HTML da linha da tabela
function gerarLinha(tipo, item) {

    const tipoUser = {
        1: 'Admin',
        2: 'Aluno',
        3: 'Professor',
        4: 'Outro' // se houver mais tipos
    };

    const lookup = {
        livros: () => `
            <td>${item.titulo}</td>
            <td>${item.nome_autor || 'Desconhecido'}</td>
            <td>${item.nome_categoria || 'Desconhecida'}</td>
            <td>${item.ano}</td>
            <td>${item.disponivel ? 'Sim' : 'Não'}</td>
            <td>${gerarEstrelas(item.media_avaliacao)}</td>
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

