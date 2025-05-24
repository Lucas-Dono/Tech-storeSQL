import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(resolve(__dirname, 'dist')));

// Todas las solicitudes no manejadas por el middleware estático
// serán redirigidas a index.html (para soporte SPA)
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
}); 