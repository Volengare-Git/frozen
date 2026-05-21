const express = require('express');
const router = express.Router();

router.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
    const data = await response.json();

    if (data.status !== 1) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const product = data.product;
    res.json({
      barcode: code,
      name: product.product_name_fr || product.product_name || '',
      brand: product.brands || '',
    });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la recherche du produit' });
  }
});

module.exports = router;
