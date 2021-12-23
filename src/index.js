const express = require('express');
const {v4: uuidv4 } = require('uuid')
const cors = require('cors');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const userName = users.find((user) => user.username === username );

  if(!userName){
    return response.status(400).json({error: "User not found"});
  }

  request.user = userName;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error: "User already exists"});
  }

  users.push({
    name,
    username,
    id: uuidv4(),
    todos: []
  });

  return response.status(200).send("Congratulations! Your now registered!")
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).send("New toDo regristred")
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const {id} = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Todo not found"})
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(400).json({error: "Todo not found!"});
  }

  todo.done = true

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoDelete = user.todos.find((todo) => todo.id === id)

  if(!todoDelete) {
    return response.status(404).json({error: "Todo not found!"})
  }

  user.todos.splice(todoDelete, 1)

  return response.status(201).send("Successfully deleted")
});

module.exports = app;