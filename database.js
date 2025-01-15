import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,           // MySQL host from env
    user: process.env.MYSQL_USER,           // MySQL user from env
    password: process.env.MYSQL_PASSWORD,   // MySQL password from env
    database: process.env.MYSQL_DATABASE    // MySQL database from env
}).promise()

// Create a new event in the database
export async function createEvent(name, date, time, location, description, image_path) {
    const [result] = await pool.query(`
        INSERT INTO events (name, date, time, location, description, image_path)
        VALUES (?, ?, ?, ?, ?, ?)
        `, [name, date, time, location, description, image_path])
    const id = result.insertId  // Get the new event ID
    return getEvent(id)         // Return the created event
}

// Retrieve all events from the database
export async function getEvents() {
    const [rows] = await pool.query("SELECT * FROM events")
    return rows // Return all events
}

// Retrieve a specific event by ID
export async function getEvent(id) {
    const [rows] = await pool.query(`
        SELECT *
        FROM events
        WHERE id = ?
        `, [id])
        return rows[0]  // Return the event object
}

// Update an existing event in the database
export async function updateEvent(id, name, date, time, location, description) {
    try {
        await pool.query(`
            UPDATE events
            SET name = ?, date = ?, time = ?, location = ?, description = ?
            WHERE id = ?
        `, [name, date, time, location, description, id])
        return getEvent(id) // Return the updated event
    } catch (error) {
        console.error('Error updating event in database:', error)   // Log error
        throw error                                                 // Rethrow the error for handling
    }
}

// Delete an event from the database
export async function deleteEvent(id) {
    try {
        await pool.query(`
            DELETE FROM events
            WHERE id = ?
        `, [id])
        return { message: 'Event deleted successfully' }    // Success message
    } catch (error) {
        console.error('Error deleting event from database:', error) // Log error
        throw error                                                 // Rethrow the error for handling
    }
}