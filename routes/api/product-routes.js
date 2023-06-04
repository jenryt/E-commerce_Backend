const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  try {
    // find all products
    const products = await Product.findAll({
      // be sure to include its associated Category and Tag data
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get one product
router.get("/:id", async (req, res) => {
  try {
    // find a single product by its `id`
    const product = await Product.findByPk(req.params.id, {
      // be sure to include its associated Category and Tag data
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

// create new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there are product tags, we need to create pairings to bulk create in the ProductTag model
      if (Array.isArray(req.body.tagIds) && req.body.tagIds.length > 0) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr).then((productTagIds) =>
          res.status(200).json(productTagIds)
        ); // Send the response inside this `then` block
      } else {
        // if no product tags, just respond with the product object
        res.status(200).json(product);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put("/:id", (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        ProductTag.findAll({
          where: { product_id: req.params.id },
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
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
        });
      }
      return Product.findByPk(req.params.id); // Return the promise
    })
    .then((productData) => {
      return res.status(200).json({
        message: "Product's data has been updated!",
        product: productData,
      });
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  try {
    // delete one product by its `id` value
    const deleteProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteProduct) {
      res.status(404).json({ message: "No matching product with this id!" });
      return;
    }
    res
      .status(200)
      .json({ message: "The product has been successfully deleted!" });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
