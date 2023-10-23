// Import dependencies
const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");
const palm = require("./palm"); // import palm module

// Function to make a request to the Ngrok API
const requestRecommendAPI = async (song) => {
  try {
    const apiUrl = `https://c18f-110-77-162-150.ngrok-free.app/request?song=${song}`; // Replace with your Ngrok API URL

    const response = await axios.get(apiUrl);

    if (response.status === 200) {
      const responseData = response.data.response;
      const recommendations = responseData.recommendations.join(", ");
      const songInfo = responseData.song;

      return `Recommended songs for "${songInfo}": ${recommendations}`; // Return the response as a string
    } else {
      return "Sorry, there was an issue with the API request.";
    }
  } catch (error) {
    console.error("Error making API request:", error);
    throw error;
  }
};

const processImage = async (imageUrl) => {
  try {
    const apiUrl = `https://507e-119-76-152-4.ngrok-free.app/?image_url=${imageUrl}`;

    const response = await axios.get(apiUrl);

    if (response.status === 200) {
      return (
        "Image processing complete. Result: " + response.data.food_prediction
      ); // Replace with how you want to handle the response.
    } else {
      return "Sorry, there was an issue with image processing.";
    }
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};

// Create a webhook via HTTP requests
// Inside your existing Firebase Cloud Function
exports.webhook = onRequest(async (req, res) => {
  if (req.method === "POST") {
    const events = req.body.events;
    for (const event of events) {
      switch (event.type) {
        case "message":
          if (event.message.type === "text") {
            // Handle text messages
            const message = event.message.text.split(" : ");
            if (message[0].toLowerCase() === "recommend song") {
              const response = await requestRecommendAPI(message[1]);
              await reply(event.replyToken, [{ type: "text", text: response }]);
            } else {
              const result = await palm.chat(event.message.text);
              const msg = result[0].candidates[0].content;
              await reply(event.replyToken, [{ type: "text", text: msg }]);
            }
          } else if (event.message.type === "image") {
            // Handle image messages
            const imageUrl = event.message.contentProvider.originalContentUrl;
            var imageResponse = null;
            if (imageUrl) {
              imageResponse = await processImage(imageUrl);
            } else {
              imageResponse =
                "You've sent an image. We don't process images at the moment.";
            }
            await reply(event.replyToken, [
              { type: "text", text: imageResponse },
            ]);
          }
          break;
      }
    }
  }
  res.send(req.method);
});

// Create a reply function with Messaging API
const reply = (token, payload) => {
  return axios({
    method: "post",
    url: `https://api.line.me/v2/bot/message/reply`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
    },
    data: { replyToken: token, messages: payload },
  });
};

// Function to send an image message
const sendImageResponse = (token, imageUrl) => {
  const imageMessage = {
    type: "image",
    originalContentUrl: imageUrl, // URL of the image
    previewImageUrl: imageUrl, // URL of a preview image
  };
  return reply(token, [imageMessage]);
};
