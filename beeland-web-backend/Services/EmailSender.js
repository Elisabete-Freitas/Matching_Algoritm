const nodemailer = require('nodemailer');
if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}

const USER = process.env.GMAIL_USER;
const PASSWORD = process.env.GMAIL_PASS;
const PORTGMAIL = process.env.GMAIL_PORT;


  

// cria o transporter sob demanda para respeitar o mock do teste
const getTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: Number(PORTGMAIL) || 465,
    secure: true,
    auth: {
      user: USER,
      pass: PASSWORD,
    },
  });
};

const sendEmail = async (subject, to, body) => {
  const mailOptions = {
    from ,
    to,
    subject,
    text: body,
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw error;
  }
};

const sendEmailWithHtml = async (subject, to, html) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(subject, to, html);
  }
  const { urlLink, message, name, title, btnText } = html;
  const mailOptions = {
    attachments: [
      {
        filename: 'beeland-logo.png',
        path: __dirname + '/beeland-logo.png',
        cid: 'beeland-logo-cid'
      }
    ],
    from: '"Beeland" ',
    to,
    subject,
    html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #E7E7E7;
                  padding: 20px;
              }
      
              .container {
                  max-width: 800px;
                  background-color: #ffffff;
                  margin: 0 auto;
                  padding: 40px;
                  border-radius: 5px;
                  box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
              }
      
              .logo {
                  display: flex;
                  justify-content: center;
                  align-items: center;
              }
      
              .logo img {
                  max-width: 200px;
                  margin-bottom: 20px;
              }
      
              .content {
                  text-align: center;
              }
      
              .btn {
                  display: inline-block;
                  background-color: #F9CD22; /* you can adjust this color */
                  color: #ffffff;
                  padding: 15px 30px;
                  border-radius: 10px;
                  text-decoration: none;
                  font-weight: bold;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo">
              <img src="cid:beeland-logo-cid" alt="Beeland Logo">
              </div>
              <div class="content">
                  <h2>${title}</h2>
                  <p>Olá, ${name}</p>
                  <p>${message}.</p>
                  <a href=${urlLink} class="btn">${btnText}</a>
              </div>
          </div>
      </body>
      </html>
      `,
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw error;
  }
};

module.exports = { sendEmail, sendEmailWithHtml };