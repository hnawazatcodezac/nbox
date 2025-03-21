const formData = require("form-data")
const Mailgun = require("mailgun.js")
const { configs } = require("../config/email-config.js")
const { configurations } = require("../config/config.js")

const url = configurations.backendBaseUrl.includes("localhost")
  ? "https://api.mailgun.net"
  // : "https://api.eu.mailgun.net";
  : "https://api.mailgun.net";
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: "api", key: configs.mailgunConfig.apiKey, url });

const sendMail = async (template, dynamicData) => {
  try {
    const data = {
      from: template.from,
      to: [dynamicData.to_email],
      template: template.name,
      "h:X-Mailgun-Variables": JSON.stringify(dynamicData),
    };
    const mailgunResults = await mg.messages.create(
      `${configs.mailgunConfig.domain}`,
      data
    );
    console.log("mailgunResults", mailgunResults);
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

module.exports = {
  sendMail
}