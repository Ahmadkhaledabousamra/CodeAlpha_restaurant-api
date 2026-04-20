const pool = require("../config/db");

const getReservations = async (req, res) => {
    const { status, date } = req.query;
    try {
        let query = `
            SELECT r.*, t.number AS table_number, t.capacity
            FROM reservations r
            LEFT JOIN tables t ON r.table_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (status) { params.push(status); query += ` AND r.status = $${params.length}`; }
        if (date)   { params.push(date);   query += ` AND DATE(r.reserved_at) = $${params.length}`; }

        query += " ORDER BY r.reserved_at ASC";
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createReservation = async (req, res) => {
    const { table_id, customer_name, customer_phone, party_size, reserved_at, notes } = req.body;

    if (!table_id || !customer_name || !party_size || !reserved_at)
        return res.status(400).json({ error: "table_id, customer_name, party_size, and reserved_at are required" });

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const tableResult = await client.query("SELECT * FROM tables WHERE id = $1", [table_id]);
        if (!tableResult.rows.length) throw new Error("Table not found");

        const table = tableResult.rows[0];
        if (table.capacity < party_size) throw new Error(`Table capacity (${table.capacity}) is less than party size (${party_size})`);

        const overlap = await client.query(`
            SELECT id FROM reservations
            WHERE table_id = $1
              AND status IN ('pending','confirmed')
              AND reserved_at BETWEEN $2::timestamp - interval '2 hours'
                              AND $2::timestamp + interval '2 hours'
        `, [table_id, reserved_at]);

        if (overlap.rows.length) throw new Error("Table already has a reservation around that time");

        const result = await client.query(
            `INSERT INTO reservations (table_id, customer_name, customer_phone, party_size, reserved_at, notes, status)
             VALUES ($1,$2,$3,$4,$5,$6,'confirmed') RETURNING *`,
            [table_id, customer_name, customer_phone, party_size, reserved_at, notes]
        );

        await client.query("UPDATE tables SET status = 'reserved' WHERE id = $1", [table_id]);

        await client.query("COMMIT");
        res.status(201).json({ message: "Reservation confirmed", reservation: result.rows[0] });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
};

const updateReservationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!validStatuses.includes(status))
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const result = await client.query(
            "UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );
        if (!result.rows.length) throw new Error("Reservation not found");

        if (status === "cancelled" || status === "completed") {
            const reservation = result.rows[0];
            await client.query("UPDATE tables SET status = 'available' WHERE id = $1", [reservation.table_id]);
        }

        await client.query("COMMIT");
        res.json({ message: `Reservation ${status}`, reservation: result.rows[0] });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports = { getReservations, createReservation, updateReservationStatus };
