import nodemailer from 'nodemailer'

const sendEmail = async options => {
    const transport = {
        service: "gmail",
        host: process.env.SMTP_HOST,
        port:process.env.SMTP_PORT, // Gmail SMTP port
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // your Gmail address
            pass: process.env.SMTP_PASS // your Gmail password
        }
    };

    const transporter = nodemailer.createTransport(transport);

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    }

    await transporter.sendMail(message);
}

export default sendEmail;