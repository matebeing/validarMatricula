import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const matricula = req.body.matricula;

    if (!matricula) {
      return res.status(400).json({ error: 'Matrícula é obrigatória.' });
    }

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      await page.goto('https://www.alunoonline.uerj.br/requisicaoaluno/#', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

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
        res.json({ matricula: match[1], nome: match[2] });
      } else {
        res.status(404).json({ error: 'Matrícula não encontrada' });
      }

      await browser.close();

    } catch (error) {
      console.error(error);
      if (error.name === 'TimeoutError') {
        res.status(500).json({ error: 'Tente novamente em alguns segundos' });
      } else {
        res.status(500).json({ error: 'Ocorreu um erro inesperado' });
      }
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
