const pool = require("../config/db");


const getDailySales = async (req, res) => {
    const date = req.query.date || new Date().toISOString().split("T")[0];

    try {
        
        const revenueResult = await pool.query(`
            SELECT
                COUNT(*)                          AS total_orders,
                COALESCE(SUM(total_price), 0)     AS total_revenue,
                COALESCE(AVG(total_price), 0)     AS avg_order_value
            FROM orders
            WHERE DATE(created_at) = $1
              AND status = 'paid'
        `, [date]);

    
        const topItemsResult = await pool.query(`
            SELECT m.name, SUM(oi.quantity) AS total_sold, SUM(oi.subtotal) AS revenue
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            JOIN orders o ON oi.order_id = o.id
            WHERE DATE(o.created_at) = $1 AND o.status = 'paid'
            GROUP BY m.name
            ORDER BY total_sold DESC
            LIMIT 5
        `, [date]);

    
        const statusResult = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM orders
            WHERE DATE(created_at) = $1
            GROUP BY status
        `, [date]);

        res.json({
            date,
            summary:    revenueResult.rows[0],
            top_items:  topItemsResult.rows,
            by_status:  statusResult.rows,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getWeeklySales = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                DATE(created_at)              AS date,
                COUNT(*)                      AS total_orders,
                COALESCE(SUM(total_price), 0) AS total_revenue
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '7 days'
              AND status = 'paid'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getStockAlerts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *, 
                CASE 
                    WHEN quantity = 0 THEN 'OUT OF STOCK'
                    WHEN quantity <= min_quantity * 0.5 THEN 'CRITICAL'
                    ELSE 'LOW'
                END AS alert_level
            FROM inventory
            WHERE quantity <= min_quantity
            ORDER BY quantity ASC
        `);
        res.json({
            total_alerts: result.rows.length,
            items: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getTableUsage = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                t.number AS table_number,
                t.capacity,
                t.status,
                COUNT(o.id)                   AS total_orders,
                COALESCE(SUM(o.total_price),0) AS total_revenue
            FROM tables t
            LEFT JOIN orders o ON t.id = o.table_id AND o.status = 'paid'
            GROUP BY t.id, t.number, t.capacity, t.status
            ORDER BY total_revenue DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getDailySales, getWeeklySales, getStockAlerts, getTableUsage };
