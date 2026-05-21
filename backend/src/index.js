const express = require('express');
const cors = require('cors');
require('dotenv').config();

const itemsRouter = require('./routes/items');
const categoriesRouter = require('./routes/categories');
const barcodeRouter = require('./routes/barcode');
const logsRouter = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/items', itemsRouter);
app.use('/categories', categoriesRouter);
app.use('/barcode', barcodeRouter);
app.use('/logs', logsRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
