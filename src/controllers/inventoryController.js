const pool = require("../config/db");


const getInventory = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM inventory ORDER BY name");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getLowStock = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM inventory WHERE quantity <= min_quantity ORDER BY quantity ASC"
        );
        res.json({ alert: `${result.rows.length} item(s) low on stock`, items: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createInventoryItem = async (req, res) => {
    const { name, unit, quantity, min_quantity } = req.body;
    if (!name || !unit) return res.status(400).json({ error: "name and unit are required" });

    try {
        const result = await pool.query(
            "INSERT INTO inventory (name, unit, quantity, min_quantity) VALUES ($1,$2,$3,$4) RETURNING *",
            [name, unit, quantity || 0, min_quantity || 10]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateInventory = async (req, res) => {
    const { id } = req.params;
    const { name, unit, quantity, min_quantity } = req.body;

    try {
        const result = await pool.query(
            `UPDATE inventory SET
                name         = COALESCE($1, name),
                unit         = COALESCE($2, unit),
                quantity     = COALESCE($3, quantity),
                min_quantity = COALESCE($4, min_quantity),
                updated_at   = NOW()
             WHERE id = $5 RETURNING *`,
            [name, unit, quantity, min_quantity, id]
        );
        if (!result.rows.length) return res.status(404).json({ error: "Item not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const restockItem = async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: "amount must be a positive number" });

    try {
        const result = await pool.query(
            "UPDATE inventory SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [amount, id]
        );
        if (!result.rows.length) return res.status(404).json({ error: "Item not found" });
        res.json({ message: `Restocked by ${amount}`, item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteInventoryItem = async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM inventory WHERE id = $1 RETURNING id", [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: "Item not found" });
        res.json({ message: "Inventory item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getInventory, getLowStock, createInventoryItem, updateInventory, restockItem, deleteInventoryItem };
