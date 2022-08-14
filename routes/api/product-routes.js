const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint
function handleError500(res) {
  return err => {
    // report error to admin
    console.log(err)
    res.status(500).json({
      error: 'Oops, we encountered an error. Try again later.'
    })
  }
}
// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  await Product.findAll({
    include: [{
       model: Category,
            //TODO: Add Product tag? 
    }]
  }).then((products) => {
    res.json(products);
  })
  .catch(handleError500);
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  Product.findByPk(req.params.id, {
    include: [
      {model: Category}
    ]
  }).then(product => res.json(product))
  .catch(handleError500(res))
});

// create new product
router.post('/', (req, res) => {
  // req.body should look like this...
  // Product.create(
  //   {
  //     product_name: req.body.product_name,
  //     price: req.body.price,
  //     stock: req.body.stock,
  //     tagIds: req.body.tagIds
  //     // TODO: TagId's doesn't work
  //   }).then(product => {res.json(product)
  //   }).catch(handleError500(res));
  
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try{
    const deleted = await Product.destroy({
      where: {
        id: req.params.id,
      }
    })
    res.json(deleted)
  }catch(err){
    handleError500(res)(err);
  }
});

module.exports = router;