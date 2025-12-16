-- Remover o usuário 'biblio' se já existir
DROP USER IF EXISTS 'biblio'@'localhost';

-- Criar usuário 'biblio'
CREATE USER 'biblio'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON *.* TO 'biblio'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Remover e criar o banco de dados 'biblioteca'
DROP DATABASE IF EXISTS biblioteca;
CREATE DATABASE IF NOT EXISTS biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE biblioteca;

-- Tabela de autores
CREATE TABLE autores (
    id_autor INT AUTO_INCREMENT PRIMARY KEY,
    nome_autor VARCHAR(100) NOT NULL,
    nacionalidade VARCHAR(50),
    data_nascimento DATE
);

-- Tabela de categorias
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(50) NOT NULL,
    descricao TEXT
);

-- Tabela de livros
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

-- Tabela de contas
CREATE TABLE contas (
    id_conta INT PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL
);

-- Inserir tipos de contas
INSERT INTO contas (id_conta, tipo) VALUES
(1, 'ADMIN'),
(2, 'ALUNO'),
(3, 'PROFESSOR');

-- Tabela de utilizadores
CREATE TABLE utilizadores (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    nome_utilizador VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    senha TEXT NOT NULL,
    id_conta INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conta) REFERENCES contas(id_conta)
);

-- Inserir utilizadores
INSERT INTO utilizadores (nome_utilizador, email, senha, id_conta) VALUES
('Admin', 'admin@gmail.com', 'admin123', 1),
('Ana Silva', 'ana.silva@email.com', 'ana123', 2),
('Carlos Mendes', 'carlos.mendes@email.com', 'carlos123', 3);

-- Tabela de empréstimos (com campos de data)
CREATE TABLE emprestimos (
    id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    data_emprestimo DATE,
    data_devolucao DATE,
    FOREIGN KEY (livro_id) REFERENCES livros(id_livro),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);

DELIMITER //
CREATE TRIGGER set_data_devolucao
BEFORE INSERT ON emprestimos
FOR EACH ROW
BEGIN
    IF NEW.data_emprestimo IS NULL THEN
        SET NEW.data_emprestimo = CURDATE();
    END IF;
    SET NEW.data_devolucao = DATE_ADD(NEW.data_emprestimo, INTERVAL 30 DAY);
END //
DELIMITER ;

-- Tabela de avaliações
CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    comentario TEXT,
    classificacao INT CHECK (classificacao BETWEEN 1 AND 5),
    livro_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    FOREIGN KEY (livro_id) REFERENCES livros(id_livro),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);

-- Tabela de reservas (com data_reserva como DATE)
CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    data_reserva DATE DEFAULT (CURDATE()),
    status ENUM('Pendente', 'Aceita') DEFAULT 'Pendente',
    FOREIGN KEY (livro_id) REFERENCES livros(id_livro),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);

-- Inserir autores
INSERT INTO autores (nome_autor, nacionalidade, data_nascimento) VALUES
('Machado de Assis', 'Brasileiro', '1839-06-21'),
('Eça de Queirós', 'Português', '1845-11-25'),
('José Saramago', 'Português', '1922-11-16');

-- Inserir categorias
INSERT INTO categorias (nome_categoria, descricao) VALUES
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

-- Inserir livros
INSERT INTO livros (titulo, autor_id, categoria_id, ano, disponivel) VALUES
('Dom Casmurro', 1, 1, 1899, TRUE),
('O Primo Basílio', 2, 2, 1878, TRUE),
('Memórias Póstumas de Brás Cubas', 1, 1, 1881, TRUE);

-- Inserir avaliações
INSERT INTO avaliacoes (livro_id, utilizador_id, comentario, classificacao) VALUES
(1, 1, 'Excelente leitura, muito profundo.', 5),
(2, 2, 'Interessante, mas um pouco lento.', 3),
(3, 3, 'Obra-prima da literatura brasileira.', 5);

-- Inserir uma reserva (exemplo)
INSERT INTO reservas (livro_id, utilizador_id, data_reserva, status) VALUES
(1, 2, CURDATE(), 'Pendente');


INSERT INTO emprestimos (livro_id, utilizador_id)
VALUES (1, 2);


