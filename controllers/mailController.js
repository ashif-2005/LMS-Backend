const nodemailer = require("nodemailer");

const Email = async (req, res) => {
  const { email, html } = req.body;
  console.log("check");

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "gvrlms5@gmail.com",
      pass: "cgzc bckx fhvd unzu",
    },
  });

  const mailOptions = {
    from: "gvrlms5@gmail.com",
    to: email,
    subject: "Leave Request",
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email");
  }
};

module.exports = { Email };
