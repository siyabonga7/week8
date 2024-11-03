require('dotenv').config();
const { sequelize } = require('./models');
const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('/');
});

app.post('/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await sequelize.models.user.create({ name, email, password: hashedPassword });
        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/expenses', async (req, res) => {
    try {
        const { salary, description } = req.body;
        if (!salary || !description) {
            return res.status(400).json({ error: 'Salary and description are required.' });
        }
        const expense = await sequelize.models.expenses.create({ salary, description });
        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating expense' });
    }
});

app.get('/expenses', async (req, res) => {
    try {
        const expenses = await sequelize.models.expenses.findAll();
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching expenses' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await sequelize.models.user.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.delete('/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await sequelize.models.expenses.destroy({ where: { id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Expense not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting expense' });
    }
});

app.patch('/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { salary, description } = req.body;
        const [updated] = await sequelize.models.expenses.update(
            { salary, description },
            { where: { id } }
        );
        if (updated) {
            const updatedExpense = await sequelize.models.expenses.findOne({ where: { id } });
            res.status(200).json(updatedExpense);
        } else {
            res.status(404).json({ error: 'Expense not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating expense' });
    }
});


app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);

    sequelize.authenticate()
        .then(() => console.log('Database connected'))
        .catch(error => console.log('Error connecting to Database', error));
});
