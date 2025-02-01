import fs from 'fs';
import path from 'path';

export default function HomePage(req, res) {
  const indexPath = path.resolve('./index.html');
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  res.status(200).send(htmlContent);
}
