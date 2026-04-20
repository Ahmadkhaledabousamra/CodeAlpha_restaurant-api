const db = require("../config/db");

exports.placeOrder = async (req, res) => {
  const { table_id, items } = req.body;

  const order = await db.query(
    "INSERT INTO orders (table_id) VALUES ($1) RETURNING *",
    [table_id]
  );

  const orderId = order.rows[0].id;

  for (let item of items) {
    await db.query(
      "INSERT INTO order_items (order_id,menu_item_id,quantity) VALUES ($1,$2,$3)",
      [orderId, item.menu_item_id, item.quantity]
    );
  }

  res.json({ message: "Order placed", orderId });
};