const db = require("../config/db");

exports.getTables = async (req, res) => {
  const result = await db.query("SELECT * FROM tables");
  res.json(result.rows);
};

exports.addTable = async (req, res) => {
  const { table_number, capacity } = req.body;

  const result = await db.query(
    "INSERT INTO tables (table_number,capacity) VALUES ($1,$2) RETURNING *",
    [table_number, capacity]
  );

  res.json(result.rows[0]);
};