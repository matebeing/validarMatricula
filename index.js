const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); 
});

app.post('/verificar', async (req, res) => {
    const matricula = req.body.matricula;
    
    if (!matricula) {
        return res.status(400).json({ error: 'Matrícula é obrigatória.' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
    
        await page.goto('https://www.alunoonline.uerj.br/requisicaoaluno/#', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
        await page.type('#matricula', matricula, { delay: 10 });
        await page.type('#senha', '000000', { delay: 10 });
    
        await Promise.all([
            page.click('.botao'),
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 })
        ]);
    
        const data = await page.content();

        const regex = new RegExp(`(${matricula}) - ([A-Za-zÀ-ÿ\\s]+)`, 'i');
        const match = data.match(regex);
    
        if (match) {
          console.log(match)
            res.json({ matricula: match[1], nome: match[2] });
        } else {
            res.status(404).json({ error: 'Matrícula não encontrada' });
        }

        await browser.close();

    } catch (error) {
        console.error(error);
        if (error.name === 'TimeoutError') {
            res.status(500).json({ error: 'Try again in a few seconds' });
        } else {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
