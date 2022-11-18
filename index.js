import express from 'express';
import { conductSearch } from './utils/search.js';

const app = express();
const PORT = 80;

app.use(express.json());

app.post("/api/webhook", async (req, res) => {
    const query = req.body.text;
    const searchResults = await conductSearch(query);
    res.send(searchResults);
});

app.post("/api/businessmessage", async (req, res) => {
  console.log('business message');
  if (req.body.message) {
    console.log(req.body);
    if (req.body.dialogflowResponse) {
      console.log(req.body.dialogflowResponse.intentResponses);
      console.log(req.body.dialogflowResponse.intentResponses[0].fulfillmentMessages)
      console.log(req.body.dialogflowResponse.intentResponses[0].fulfillmentMessages[0])
    }
  }
  if (req.body.clientToken === "INSERT_GBM_TOKEN") {
    res.send(req.body.secret);
  } else {
    res.status(403).send("Invalid client token");
  }

});

app.listen(PORT, () => {
    console.log(`Webhook server is linstening on port ${PORT}`);
})