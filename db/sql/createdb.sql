-- PostgreSQL v14
create database "smart-brain";

create table if not exists users (
  id serial primary key,
  name varchar(255) not null,
  email text unique not null,
  entries int default 0,
  created_when timestamp default current_timestamp
);

create table if not exists logins (
  user_id int not null,
  hash varchar(100) not null,
  email text unique not null,
  created_when timestamp default current_timestamp,
  foreign key (user_id) references users (id),
  primary key (user_id)
);