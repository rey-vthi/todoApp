const express = require('express');
const redis = require('redis');
const {toggleStatus, getDefault} = require('./statusIterator');

const app = express();
const getRedisClient = function() {
  if (process.env.REDISCLOUD_URL) {
    return redis.createClient(process.env.REDISCLOUD_URL, {
      no_ready_check: true
    });
  }
  return redis.createClient();
};

const client = getRedisClient();

const defaultTodoList = () => ({title: 'Todo', todoList: [], lastTaskId: 0});

client.get('todoList', (err, data) => {
  if (err) app.locals.Todo = defaultTodoList();
  app.locals.Todo = JSON.parse(data) || defaultTodoList();
});

const saveTodoList = function(req, res) {
  const data = JSON.stringify(req.app.locals.Todo);
  client.set('todoList', data, err => {
    if (err) res.end(`Error Occurred\n ${err}`);
    res.end(data);
  });
};

app.use(express.json());
app.use(express.static('public'));

app.get('/api/getAllTodo', (req, res) => {
  res.json(req.app.locals.Todo);
});

app.post('/api/addTodo', (req, res) => {
  const {todo} = req.body;
  const {Todo} = req.app.locals;
  Todo.lastTaskId++;
  Todo.todoList.push({todo, id: Todo.lastTaskId, status: getDefault()});
  saveTodoList(req, res);
});

app.post('/api/toggleTodoStatus', (req, res) => {
  const {todoId} = req.body;
  const {Todo} = req.app.locals;
  const task = Todo.todoList.find(task => task.id === todoId);
  task.status = toggleStatus(task.status);
  saveTodoList(req, res);
});

app.post('/api/deleteTodo', (req, res) => {
  const {todoId} = req.body;
  const {Todo} = req.app.locals;
  Todo.todoList = Todo.todoList.filter(task => task.id !== todoId);
  saveTodoList(req, res);
});

app.post('/api/updateTitle', (req, res) => {
  const {title} = req.body;
  const {Todo} = req.app.locals;
  Todo.title = title;
  saveTodoList(req, res);
});

app.post('/api/deleteAllTodo', (req, res) => {
  const {Todo} = req.app.locals;
  Todo.todoList = [];
  Todo.lastTaskId = 0;
  saveTodoList(req, res);
});

const port = process.env.PORT || 3001;

app.listen(port, () => console.log('server listening at 3001'));
