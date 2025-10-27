const OneSignal = require("@onesignal/node-onesignal");
const axios = require("axios");

const sendNotification = async (tagKey, tagValue, message) => {
  console.log("Notification sent:", tagKey, String(tagValue), message);
  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: process.env.ONESIGNAL_APP_ID, 
        filters: [
          { field: "tag", key: String(tagKey), relation: "=", value: tagValue }
        ],
        contents: { en: message },
        headings: { en: "Notificação de Beeland" }
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`, 
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Notification sent:", response.data);
  } catch (error) {
    console.error("Error sending notification:", error.response ? error.response.data : error.message);
  }
};


module.exports = { sendNotification };
