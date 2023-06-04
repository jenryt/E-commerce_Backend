const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product }],
    });
  } catch (error) {}
  // find all categories
  // be sure to include its associated Products
});

router.get("/:id", async (req, res) => {
  try {
  } catch (error) {}
  // find one category by its `id` value
  // be sure to include its associated Products
});

router.post("/", async (req, res) => {
  try {
  } catch (error) {}
  // create a new category
});

router.put("/:id", async (req, res) => {
  try {
  } catch (error) {}
  // update a category by its `id` value
});

router.delete("/:id", async (req, res) => {
  try {
  } catch (error) {}
  // delete a category by its `id` value
});

module.exports = router;
