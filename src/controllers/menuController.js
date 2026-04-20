const db = require("../config/db");

exports.getMenu = async (req, res) => {
  const result = await db.query("SELECT * FROM menu_items");
  res.json(result.rows);
};

exports.addMenu = async (req, res) => {
  const { name, price, category_id } = req.body;

  const result = await db.query(
    "INSERT INTO menu_items (name,price,category_id) VALUES ($1,$2,$3) RETURNING *",
    [name, price, category_id]
  );

  res.json(result.rows[0]);
};

exports.addCategory = async (req, res) => {
  const { name } = req.body;

  const result = await db.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name]
  );

  res.json(result.rows[0]);
};