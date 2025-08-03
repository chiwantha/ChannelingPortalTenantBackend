import axios from "axios";

export const sendWhatsappMessage = async (to, message) => {
  try {
    const res = await axios.post(
      `https://api.kchord.com/wa/send`,
      {
        to: `94${to}`,
        message: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "k-chord-api-key": "kchord_7c1f4b6e2d5a45ffaf9a8f0e4bdc3c17",
        },
      }
    );
  } catch (error) {
    console.error(
      "whatsapp sending failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
