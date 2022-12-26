const { config } = require('dotenv');
const config2 = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const helmet = require('helmet');
const morgan = require('morgan');
const Joi = require('joi');
const logger = require('./logger');
const authenticator = require('./authenticator');
const express = require('express');
const app = express();

config();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(express.static('public'));
app.use(helmet());

// Environment Variable Configuration
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log('Application Name: ' + config2.get('name'));
console.log('Mail Server: ' + config2.get('mail.host'));
console.log(`Mail Password: ${process.env.app_password}`);

//console.log(`app: ${app.get('env')}`);

//console.log('Application Name: ' + config2.get('name'));
//console.log('Mail Server: ' + config2.get('mail.host'));
//console.log('Mail Password: ' + config.get('mail.password'));

// if (app.get('env') === 'development'){
//     app.use(morgan('tiny'));
//     console.log('Morgan enabled...');
// }

if (process.env.NODE_ENV === 'development'){
    app.use(morgan('tiny'));
    startupDebugger('Morgan enabled...');
}

//Db work 
dbDebugger('Connected to the database');

//Custom middleware functions
app.use(logger);
app.use(authenticator);


const courses = [
    {id: 1, name: 'course1' },
    {id: 2, name: 'course2' },
    {id: 3, name: 'course3' }
];

app.get('/', (req, res) => {
    //res.send('Hello World!');
    res.render('index', {title: 'My Express App',message: 'Hello'});
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given Id was not found');
    res.send(course);
});

app.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.params);
});

app.post('/api/courses', (req, res) => {
    const schema = Joi.object({ name: Joi.string().min(3).required()});            
    const validation = schema.validate(req.body); 
    if (validation.error) {
        return res.status(400).send(result.error.details[0].message);        
    }
    console.log(validation);

    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given Id was not found');
        
    const schema = Joi.object({ name: Joi.string().min(3).required()});            
    const validation = schema.validate(req.body); 
    if (validation.error) return res.status(400).send(result.error.details[0].message);

    course.name = req.body.name;
    res.send(course)
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given Id was not found');
   
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    
    res.send(course);
});

const PORT = parseInt(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});