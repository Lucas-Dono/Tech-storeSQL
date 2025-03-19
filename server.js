import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuración de multer para almacenar archivos temporalmente en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'));
    }
    cb(null, true);
  }
});

// Función para procesar imagen a WebP
async function processImage(buffer, filename) {
  try {
    const uploadDir = join(__dirname, 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const webpFilename = `${filename}.webp`;
    const outputPath = join(uploadDir, webpFilename);

    await sharp(buffer)
      .webp({ quality: 80 }) // Calidad del 80%
      .resize(1920, 1920, { // Máximo 1920x1920
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(outputPath);

    return webpFilename;
  } catch (error) {
    console.error('Error procesando imagen:', error);
    throw error;
  }
}

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(join(__dirname, 'uploads')));

const PRODUCTS_FILE = join(__dirname, 'src/data/products.json');

// Asegurar que el archivo existe
async function ensureProductsFile() {
  try {
    await fs.access(PRODUCTS_FILE);
  } catch (error) {
    // Si el archivo no existe, créalo con un array vacío
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify({ products: [] }, null, 2));
  }
}

// Leer productos
async function readProducts() {
  await ensureProductsFile();
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? { products: parsed } : parsed;
  } catch (error) {
    console.error('Error al leer productos:', error);
    return { products: [] };
  }
}

// Escribir productos
async function writeProducts(products) {
  await ensureProductsFile();
  try {
    const data = Array.isArray(products) ? { products } : products;
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error al escribir productos:', error);
    throw error;
  }
}

// GET /api/products - Obtener todos los productos
app.get('/api/products', async (req, res) => {
  try {
    const data = await readProducts();
    res.json(data.products || []);
  } catch (error) {
    console.error('Error al leer productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/products/:id - Obtener un producto por ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const data = await readProducts();
    const product = data.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error al leer producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/products - Crear un nuevo producto
app.post('/api/products', async (req, res) => {
  try {
    const data = await readProducts();
    const newProduct = {
      ...req.body,
      id: String(Date.now()),
      createdAt: new Date().toISOString()
    };
    
    data.products.push(newProduct);
    await writeProducts(data);
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/products/:id - Actualizar un producto
app.put('/api/products/:id', async (req, res) => {
  try {
    const data = await readProducts();
    const index = data.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const updatedProduct = {
      ...data.products[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    data.products[index] = updatedProduct;
    await writeProducts(data);
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id - Eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const data = await readProducts();
    const filteredProducts = data.products.filter(p => p.id !== req.params.id);
    
    if (filteredProducts.length === data.products.length) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    await writeProducts({ products: filteredProducts });
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// POST /api/upload - Subir imágenes
app.post('/api/upload', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se han subido archivos' });
    }

    const processedImages = await Promise.all(
      req.files.map(async (file) => {
        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const webpFilename = await processImage(file.buffer, filename);
        return `${req.protocol}://${req.get('host')}/uploads/${webpFilename}`;
      })
    );

    res.json({ imageUrls: processedImages });
  } catch (error) {
    console.error('Error al procesar imágenes:', error);
    res.status(500).json({ error: 'Error al procesar imágenes' });
  }
});

// POST /api/upload/video - Subir video
app.post('/api/upload/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún video' });
    }

    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ videoUrl });
  } catch (error) {
    console.error('Error al subir video:', error);
    res.status(500).json({ error: 'Error al subir video' });
  }
});

// DELETE /api/media - Eliminar archivo multimedia
app.delete('/api/media', async (req, res) => {
  try {
    const urlData = req.body;
    console.log('Datos recibidos:', urlData);

    if (!urlData || (!urlData.url && typeof urlData !== 'string')) {
      return res.status(400).json({ error: 'URL no proporcionada correctamente' });
    }

    // Extraer la URL del objeto o usar directamente si es string
    const urlToDelete = typeof urlData === 'string' ? urlData : urlData.url;
    
    // Verificar si es una URL del servidor
    if (!urlToDelete.includes('http://localhost:3001/uploads/')) {
      return res.status(400).json({ 
        error: 'URL inválida. Debe ser una URL del servidor.' 
      });
    }

    console.log('URL a eliminar:', urlToDelete);

    // Extraer el nombre del archivo de la URL
    const filename = urlToDelete.split('/uploads/').pop();
    if (!filename) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    console.log('Nombre del archivo a eliminar:', filename);
    const filepath = join(__dirname, 'uploads', filename);
    console.log('Ruta completa del archivo:', filepath);

    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
      console.log('Archivo eliminado exitosamente');
      res.status(204).send();
    } catch (error) {
      console.error('Error al intentar eliminar el archivo:', error);
      if (error.code === 'ENOENT') {
        console.log('El archivo no existía');
        res.status(204).send();
      } else {
        res.status(500).json({ 
          error: 'Error al eliminar el archivo',
          details: error.message
        });
      }
    }
  } catch (error) {
    console.error('Error en el endpoint delete /api/media:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud de eliminación',
      details: error.message
    });
  }
});

// Inicializar el servidor
app.listen(PORT, async () => {
  try {
    await ensureProductsFile();
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  } catch (error) {
    console.error('Error al inicializar el servidor:', error);
    process.exit(1);
  }
}); 