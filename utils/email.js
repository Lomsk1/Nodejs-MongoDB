import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import path from 'path';

dotenv.config();

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Giorgi Lomsianidze <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send grid
      return nodemailer.createTransport({
        service: `SendGrid`,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual Email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(path.join(`views/emails/${template}.pug`), {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html, //as we wish. we can choose only text field for easy text
      text: htmlToText.toString(html),
      // text: options.message,
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Test Family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'your password reset token (valid for only 10 minutes)'
    );
  }
}

export default Email;
