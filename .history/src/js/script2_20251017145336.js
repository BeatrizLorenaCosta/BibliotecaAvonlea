document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
            document.getElementById(btn.dataset.section).classList.remove('hidden');
            carregarDados(btn.dataset.section);
        });
    });

    carregarSelects(); // Preenche selects de autores e categorias
});

// Função para carregar dados da API
function carregarDados(tipo) {
    fetch(`/api/${tipo}`)
        .then(res => res.json())
        .then(dados => preencherTabela(tipo, dados))
        .catch(err => alert(`Erro ao carregar ${tipo}: ${err}`));
}

// Preenche a tabela com os dados
function preencherTabela(tipo, dados) {
    const tbody = document.querySelector(`#tabela-${tipo} tbody`);
    tbody.innerHTML = '';

    dados.forEach(item => {
        const tr = document.createElement('tr');

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
        tbody.appendChild(tr);
    });
}

// Adiciona ou atualiza um registro
function adicionarOuAtualizar(tipo) {
    const form = document.getElementById(`form-${tipo}`);
    const dados = {};

    form.querySelectorAll('input, select, textarea').forEach(el => {
        const campo = el.id.split('-')[1];
        dados[campo] = el.type === 'checkbox' ? el.checked : el.value;
    });

    const method = dados.id ? 'PUT' : 'POST';
    const url = dados.id ? `/api/${tipo}/${dados.id}` : `/api/${tipo}`;

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(res => res.json())
    .then(resp => {
        alert(resp.mensagem || 'Operação realizada com sucesso!');
        form.reset();
        carregarDados(tipo);
    })
    .catch(err => alert(`Erro ao salvar ${tipo}: ${err}`));
}

// Preenche o formulário para edição
function editar(tipo, id) {
    fetch(`/api/${tipo}`)
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

// Exclui um registro
function deletar(tipo, id) {
    if (confirm('Tem certeza que deseja excluir?')) {
        fetch(`/api/${tipo}/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(resp => {
                alert(resp.mensagem || 'Registro excluído!');
                carregarDados(tipo);
            })
            .catch(err => alert(`Erro ao excluir ${tipo}: ${err}`));
    }
}

// Preenche selects de autores e categorias
function carregarSelects() {
    fetch('/api/autores')
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

    fetch('/api/categorias')
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