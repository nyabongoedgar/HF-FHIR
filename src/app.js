import express from "express";
import error from './middleware/error/error';
import routes from './modules';

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes(app);

app.get('/', (req, res) => {
    const quotes = [
        "“Life is what happens when you’re busy making other plans.” – John Lennon",
        "“The future belongs to those who believe in the beauty of their dreams.” – Eleanor Roosevelt",
        "“Tell me and I forget. Teach me and I remember. Involve me and I learn.” – Benjamin Franklin",
        "“In the end, we will remember not the words of our enemies, but the silence of our friends.” – Martin Luther King, Jr.",
        "“Life itself is the most wonderful fairy tale.” – Hans Christian Andersen"
    ]; 
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    res.send(`
        <h2>Welcome to our interesting index route!</h2>
        <blockquote>${randomQuote}</blockquote>
    `);
});

app.use(error.converter);

//catch 404 and forward to error handler
app.use(error.notFound);

//error handler, send stacktrace only during development
app.use(error.handler);


export default app;



