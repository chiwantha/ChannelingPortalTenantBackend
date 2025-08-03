import axios from "axios";

const apiKey = "2102|xXnGJh3z6CBhVam9Jr3rgeD3M42iWLNh5iX7arqe";

export const sendSms = async (to, message) => {
  try {
    const res = await axios.post(
      "https://sms.send.lk/api/v3/sms/send",
      {
        recipient: to,
        sender_id: "K-Chord Grp",
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("SMS Sent:", res.data);
    return res.data;
  } catch (error) {
    console.error("SMS sending failed:", error.response?.data || error.message);
    throw error;
  }
};

export const smsBalance = async () => {
  try {
    const res = await axios.get(`https://sms.send.lk/api/v3/balance`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error(
      "SMS balance fetch failed:",
      error.response?.data || error.message
    );
    return { balance: 0, error: true }; // return safe fallback
  }
};
