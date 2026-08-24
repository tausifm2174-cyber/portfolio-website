const { Resend } = require('resend');

// Helper to escape HTML characters in user input to prevent HTML injection in emails
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = async function handler(req, res) {
    // 1. Accept only POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({
            success: false,
            error: `Method ${req.method} Not Allowed`
        });
    }

    // 2. Parse request body
    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return res.status(400).json({
                success: false,
                error: 'Invalid JSON payload'
            });
        }
    }

    const { name, email, message } = body || {};

    // 3. Validation: name, email, message required and non-empty
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Name is required'
        });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Email is required'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a valid email address'
        });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Message is required'
        });
    }

    // 4. Verify Resend API Key is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('Missing RESEND_API_KEY environment variable.');
        return res.status(500).json({
            success: false,
            error: 'Email service is not configured on the server.'
        });
    }

    try {
        const resend = new Resend(apiKey);
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedMessage = message.trim();

        // NOTE: 'onboarding@resend.dev' is Resend's default testing domain which works
        // out of the box without domain verification. For reliable long-term production
        // delivery, verify your custom domain in the Resend dashboard (https://resend.com/domains)
        // and change the 'from' address to something like 'contact@yourdomain.com'.
        const { data, error } = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: ['mtausif1316@gmail.com'],
            reply_to: trimmedEmail,
            replyTo: trimmedEmail,
            subject: `New portfolio contact from ${trimmedName}`,
            text: `New contact form submission\n\nName: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff; color: #111111;">
                    <h2 style="margin-top: 0; color: #111827; border-bottom: 1px solid #eaeaea; padding-bottom: 12px;">New Contact Form Message</h2>
                    <p style="margin: 12px 0;"><strong>Name:</strong> ${escapeHtml(trimmedName)}</p>
                    <p style="margin: 12px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(trimmedEmail)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(trimmedEmail)}</a></p>
                    <div style="margin-top: 20px; padding: 16px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #3b82f6;">
                        <strong style="display: block; margin-bottom: 8px; color: #374151;">Message:</strong>
                        <p style="margin: 0; white-space: pre-wrap; color: #1f2937; line-height: 1.6;">${escapeHtml(trimmedMessage)}</p>
                    </div>
                    <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 12px;">
                        Sent from your developer portfolio contact form. Hit reply directly to respond to ${escapeHtml(trimmedName)}.
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('Resend API error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send message via email service.'
            });
        }

        return res.status(200).json({
            success: true,
            id: data?.id
        });
    } catch (err) {
        console.error('Unexpected error while sending email:', err);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred while processing your request.'
        });
    }
};
