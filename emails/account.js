const sendGridAPIKey = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(sendGridAPIKey);

sgMail.send({
  to: 'jefersonsilva4k@hotmail.com',
  from: 'jefersonsilva4k@gmail.com',
  subject: 'Test 01',
  text: 'This is my message'
});

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'jefersonsilva4k@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name} Let me know how you get along with the app.`
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'jefersonsilva4k@gmail.com',
    subject: 'This is sad',
    text: `It's been a long road, goodbye,${name}. I hope to see you back sometime soon`
  });
};

module.exports = { sendWelcomeEmail, sendCancelationEmail };
