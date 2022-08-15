const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');
// const { findAll } = require('../../models/Category');

// The `/api/tags` endpoint
function handleError500(res) {
  return err => {
    // report error to admin
    console.log(err)
    res.status(500).json({
      error: 'Oops, we encountered an error. Try again later.'
    })
  }
}

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  Tag.findAll({
    include: [{
      ProductTag
    }]
  }).then((tags) => {
    res.json(tags);
  })
  .catch(handleError500);
  // try {
  //   const tagData = await Tag.findAll({
  //     include: [{ model: Product }, {model: ProductTag}],
  //   });
  //   res.status(200).json(tagData);
  // } catch (err) {
  //   res.status(500).json(err);
  // }
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create({
    tag_name: req.body.tag_name,
  }).then(tag => {
    res.json(tag)
  })
  .catch(handleError500(res));
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try{
    const updated = await Tag.update({
      tag_name: req.body.tag_name,
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
  // delete on tag by its `id` value
  try{
    const deleted = await Tag.destroy({
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
