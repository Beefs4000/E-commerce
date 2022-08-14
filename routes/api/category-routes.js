const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

function handleError500(res){ 
  return err => {
    // report error to admin
    console.log(err)
    res.status(500).json({
      error: 'Oops, we encountered an error. Try again later.'
    })
  }
}

router.get('/', (req, res) => {
  // find all categories
  // be sure to include its associated Products
  Category.findAll({
    include: [
      { model: Product }
    ]
  }).then((categories) => {
    res.json(categories);
  })
  .catch(handleError500);
});

router.get('/:id', (req, res) => {
  // find one category by its `id` value
  Category.findByPk(req.params.id, {
    include: [
      {model: Product}
    ]
  }).then(category => res.json(category))
  .catch(handleError500(res))
  // be sure to include its associated Products
});

router.post('/', (req, res) => {
  // create a new category
  Category.create({
    category_name: req.body.category_name,
  }).then(category => {
    res.json(category)
  })
  .catch(handleError500(res));
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  // Update seems to be 'async' according to Sam, Try catch seems to work
  try{
    const updated = await Category.update({
      category_name: req.body.category_name,
    }, {
      where: {
        id: req.params.id,
      }
    })
    res.json(updated)
  }catch(err){
    console.log(err);
    handleError500(res)(err)
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try{
  const deleted = await Category.destroy({
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
