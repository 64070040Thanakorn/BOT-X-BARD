// Import dependencies
const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");
const palm = require("./palm"); // import palm module

// Create a webhook via HTTP requests
exports.webhook = onRequest(async (req, res) => {
  if (req.method === "POST") {
    const events = req.body.events;
    for (const event of events) {
      switch (event.type) {
        case "message":
          // if (event.message.type === "text") {
          //   const result = await palm.text(event.message.text);
          //   const msg = result[0].candidates[0].output;
          //   await reply(event.replyToken, [{ type: "text", text: msg }]);
          // }
          if (event.message.type === "text") {
            if (event.message.text === "เลือกเพลง"){
              await reply(event.replyToken, [{ type: "text", text: "เลือกเพลง" }]);
                // const test = ยิง api (event.message.text)
                // await reply(event.replyToken, [{ type: "text", text: test }]);
            }
            const result = await palm.chat(event.message.text);
            const msg = result[0].candidates[0].content;
            await reply(event.replyToken, [{ type: "text", text: msg }]);
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
