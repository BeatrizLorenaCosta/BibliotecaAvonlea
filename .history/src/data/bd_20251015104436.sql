
-- Remover o usuário 'biblio' se já existir
DROP USER IF EXISTS 'biblio'@'localhost';

-- Criar o usuário 'biblio' com senha
CREATE USER 'biblio'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON *.* TO 'biblio'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Criar a base de dados
CREATE DATABASE IF NOT EXISTS biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Usar a base de dados
USE biblioteca;

-- Criar tabela de autores
CREATE TABLE autores (
    id_autor INT AUTO_INCREMENT PRIMARY KEY,
    nome_autor VARCHAR(100) NOT NULL,
    nacionalidade VARCHAR(50),
    data_nascimento DATE
);

-- Criar tabela de categorias
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(50) NOT NULL,
    descricao TEXT
);

-- Criar tabela de livros
CREATE TABLE livros (
    id_livro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor_id INT NOT NULL,
    categoria_id INT NOT NULL,
    ano INT,
    disponivel BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (autor_id) REFERENCES autores(id_autor),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria)
);

-- Criar tabela de utilizadores
CREATE TABLE utilizadores (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    nome_utilizador VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    tipo ENUM('aluno','professor','outro') NOT NULL
);

-- Criar tabela de empréstimos
CREATE TABLE emprestimos (
    id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    data_emprestimo DATE,
    data_devolucao DATE,
    FOREIGN KEY (livro_id) REFERENCES livros(id_livro),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);

-- Criar tabela de avaliações
CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    comentario TEXT,
    classificacao INT CHECK (classificacao BETWEEN 1 AND 5),
    livro_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    FOREIGN KEY (livro_id) REFERENCES livros(id_livro),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);
``
