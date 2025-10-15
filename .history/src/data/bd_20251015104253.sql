drop user 'biblio'@localhost;
create user 'biblio'@localhost identified by '12345';
grant all privileges on *.* to 'biblio'@localhost with grant option;
flush privileges;

create database biblioteca;
use biblioteca;


create table autores (
id_autor int auto_increment primary key,
nome_autor varchar(100) not null,
nacionalidade varchar(50),
data_nascimento date
);

create table categorias (
id_categoria int auto_increment primary key,
nome_categoria varchar(50) not null,
descricao text
);

create table livros (
id_livro int auto_increment primary key,
titulo varchar(200) not null,
autor_id int not null,
categoria_id int not null,
ano int,
disponivel boolean default true
);

create table utilizadores (
id_utilizador int auto_increment primary key,
nome_utilizador varchar(100) not null,
email varchar(100) unique,
tipo enum('aluno','professor','outro') not null
);

create table emprestimos (
id_emprestimos int auto_increment primary key,
livro_id int,
utilizador_id int,
data_emprestimo date,
data_devolcao date
);

create table avaliacoes (
id_avaliacao int auto_increment primary key,
comentario text,
classificacao int,
livro_id int,
utilizador_id int
);

