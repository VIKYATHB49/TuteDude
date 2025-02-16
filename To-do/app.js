const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
let tasks = [];
app.get('/', (req, res) => {
    res.render('index', { tasks });
});

app.post('/add', (req, res) => {
    const newTask = {
        title: req.body.taskTitle,
        completed: false
    };
    tasks.unshift(newTask); 
    res.redirect('/');
});

app.post('/update/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    if (taskId >= 0 && taskId < tasks.length) {
        tasks[taskId].completed = req.body.completed === 'true';
    }
    res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    if (taskId >= 0 && taskId < tasks.length) {
        tasks.splice(taskId, 1);
    }
    res.redirect('/');
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});