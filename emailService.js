import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.EMAIL_USER,   // Email user from env
        pass: process.env.EMAIL_PASS    // Email password from env
    }
})

// Format date to readable string
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
}

// Format time to 12-hour format
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const isAM = hour < 12
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${isAM ? 'AM' : 'PM'}`
}

// Send event details via email
export const sendEventDetails = async (to, event) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,               // Sender's email
        to: to,                                     // Recipient's email
        subject: `Event Details: ${event.name}`,    // Email subject
        text: `
            Event Name: ${event.name}
            Date: ${formatDate(event.date)}
            Time: ${formatTime(event.time)}
            Location: ${event.location}
            Description: ${event.description}
        `,
        html: `
            <h1>${event.name}</h1>
            <p><strong>Date:</strong> ${formatDate(event.date)}</p>
            <p><strong>Time:</strong> ${formatTime(event.time)}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <br />
        `
    }

    return transporter.sendMail(mailOptions)    // Send email
}