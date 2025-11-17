-- Remover o usuário 'biblio' se já existir
DROP USER IF EXISTS 'biblio'@'localhost';

CREATE USER 'biblio'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON *.* TO 'biblio'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

DROP DATABASE IF EXISTS biblioteca;
CREATE DATABASE IF NOT EXISTS biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE biblioteca;

CREATE TABLE autores (
    id_autor INT AUTO_INCREMENT PRIMARY KEY,
    nome_autor VARCHAR(100) NOT NULL,
    nacionalidade VARCHAR(50),
    data_nascimento DATE
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(50) NOT NULL,
    descricao TEXT
);

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

CREATE TABLE contas (
    id_conta INT PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL
);

INSERT INTO contas (id_conta ,tipo ) VALUES
(1, 'ADMIN'),
(2, 'ALUNO'),
(3, 'PROFESSOR');

CREATE TABLE utilizadores (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    nome_utilizador VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    senha TEXT NOT NULL,
    id_conta INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conta) REFERENCES contas(id_conta)
);

INSERT INTO utilizadores (nome_utilizador, email, senha, id_conta)
VALUES 
('Admin', 'admin@gmail.com','admin123', 1),
('Ana Silva', 'ana.silva@email.com','ana123', 2),
('Carlos Mendes', 'carlos.mendes@email.com', 'carlos123', 3),

CREATE TABLE emprestimos (
    id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    data_emprestimo DATE,
    data_devolucao DATE,
    FOREIGN KEY (livro_id) REFERENCES livros(id_livro),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);

CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    comentario TEXT,
    classificacao INT CHECK (classificacao BETWEEN 1 AND 5),
    livro_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    FOREIGN KEY (livro_id) REFERENCES livros(id_livro),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);


INSERT INTO autores (nome_autor, nacionalidade, data_nascimento)
VALUES 
('Machado de Assis', 'Brasileiro', '1839-06-21'),
('Eça de Queirós', 'Português', '1845-11-25'),
('José Saramago', 'Português', '1922-11-16');

INSERT INTO categorias (nome_categoria, descricao)
VALUES 
('Romance', 'Narrativas longas com desenvolvimento de personagens'),
('Realismo', 'Movimento literário que retrata a realidade'),
('Ficção Científica', 'Histórias com elementos científicos e tecnológicos'),
('Fantasia', 'Histórias com elementos mágicos ou sobrenaturais'),
('Mistério', 'Narrativas centradas em crimes ou enigmas a resolver'),
('Terror', 'Histórias que provocam medo ou suspense'),
('Aventura', 'Relatos de viagens e desafios emocionantes'),
('História', 'Obras baseadas em eventos históricos ou épocas passadas'),
('Biografia', 'Narrativas sobre a vida de pessoas reais'),
('Poesia', 'Textos literários em verso, focados em emoções e ritmo'),
('Drama', 'Narrativas com conflitos intensos entre personagens'),
('Infantojuvenil', 'Livros direcionados para crianças e adolescentes'),
('Humor', 'Obras com caráter cômico ou satírico'),
('Autoajuda', 'Livros que oferecem conselhos para desenvolvimento pessoal'),
('Clássicos', 'Obras reconhecidas como importantes na literatura universal');



INSERT INTO livros (titulo, autor_id, categoria_id, ano, disponivel)
VALUES 
('Dom Casmurro', 1, 1, 1899, true),
('O Primo Basílio', 2, 2, 1878, true),
('Memórias Póstumas de Brás Cubas', 1, 1, 1881, true);

INSERT INTO avaliacoes (livro_id, utilizador_id, comentario, classificacao)
VALUES 
(1, 1, 'Excelente leitura, muito profundo.', 5),
(2, 2, 'Interessante, mas um pouco lento.', 3),
(3, 3, 'Obra-prima da literatura brasileira.', 5);




