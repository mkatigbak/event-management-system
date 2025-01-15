import express from 'express'
import multer from 'multer'
import fs from 'fs'
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from './database.js'
import { sendEventDetails } from './emailService.js'

const app = express()
const upload = multer({dest: 'uploads/'})   // Configure multer for file uploads

app.use(express.json())                         // Parse JSON request bodies
app.use(express.static('public'))               // Serve static files from 'public'
app.use('/uploads', express.static('uploads'))  // Serve files from the uploads directory

// Create a new event with an image upload
app.post("/events", upload.single('image'), async (req, res) => {
    const { name, date, time, location, description } = req.body
    const image_path = req.file.path    // Get the uploaded file path
    const event = await createEvent(name, date, time, location, description, image_path)
    res.status(201).send(event)         // Respond with the created event
})

// Retrieve all events
app.get("/events", async (req, res) => {
    const events = await getEvents()
    res.send(events)    // Respond with all events
})

// Retrieve a specific event by ID
app.get("/events/:id", async (req, res) => {
    const id = req.params.id
    const event = await getEvent(id)
    res.send(event) // Respond with the event
})

// Update an existing event
app.put("/events/:id", async (req, res) => {
    const id = req.params.id
    const { name, date, time, location, description } = req.body

    try {
        const event = await updateEvent(id, name, date, time, location, description)
        res.send(event) // Respond with the updated event
    } catch (error) {
        console.error('Error updating event:', error)   // Log error
        res.status(500).send('Error updating event')    // Error response
    }
})

// Delete an event
app.delete("/events/:id", async (req, res) => {
    const id = req.params.id
    try {
        const event = await getEvent(id)
        if (!event) {
            return res.status(404).send('Event not found')  // Handle event not found
        }

        // Delete the image file from the uploads directory
        if (event.image_path) {
            fs.unlink(event.image_path, (err) => {
                if (err) {
                    console.error('Error deleting image:', err) // Log error if file deletion fails
                }
            })
        }

        const result = await deleteEvent(id)    // Delete the event from the database
        res.send(result)                        // Respond with deletion result
    } catch (error) {
        console.error('Error deleting event:', error)   // Log error
        res.status(500).send('Error deleting event')    // Error response
    }
})

// Send event details via email
app.post("/events/:id/send-email", async (req, res) => {
    const id = req.params.id
    const { email } = req.body  // Get the email from the request body

    try {
        const event = await getEvent(id)
        if (!event) {
            return res.status(404).send('Event not found')  // Handle event not found
        }

        await sendEventDetails(email, event)                        // Send the email
        res.send({ message: 'Event details sent successfully' })    // Success response
    } catch (error) {
        console.error('Error sending email:', error)    // Log error
        res.status(500).send('Error sending email')     // Error response
    }
})

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)                    // Log error stack
    res.status(500).send('Something broke!')    // Error response
})

// Start the server
app.listen(8080, () => {
    console.log('Server is running on port 8080')   // Log server start
})