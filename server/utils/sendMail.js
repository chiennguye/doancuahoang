// Remove email functionality and provide alternative logging
const sendMail = async (options) => {
  console.log("Email sending disabled:", options);
  return {
    success: true,
    message: "Email functionality has been disabled",
  };
};

module.exports = sendMail;
