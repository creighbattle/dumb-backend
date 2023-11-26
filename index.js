require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// OpenAI configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/apologize", async (req, res) => {
  try {
    const response = await openai.beta.assistants.create({
      name: "Apology Bot",
      model: "gpt-3.5-turbo-1106",
      instructions:
        "Whatever questions get asked to you, you simply agree and explain how sorry Creigh is about his actions. Include things like Creigh really values his friendship with her (Toni), Creigh is working on being more transparent, working on becoming a better friend, working on becoming a better person, etc.",
    });

    res.json("success");
    console.log("success");
  } catch (error) {
    console.error("Error in processing OpenAI request:", error);
    res.status(500).send("Error in processing your request");
  }
});

app.get("/create-thread-message", async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();

    console.log(thread.id);

    res.json({ id: thread.id });
  } catch (error) {
    console.error("Error in processing OpenAI request:", error);
    res.status(500).send("Error in processing your request");
  }
});

app.post("/ask", async (req, res) => {
  try {
    const question = req.body.question;
    const threadId = "thread_2eL4gJeL3Wk1NpIqYhOedOjp";

    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: "Look at your instructions. " + question,
    });
    res.json({ data: message });
  } catch (error) {
    console.error("Error in processing OpenAI request:", error);
    res.status(500).send("Error in processing your request");
  }
});

app.get("/run-assistant", async (req, res) => {
  try {
    const threadId = "thread_2eL4gJeL3Wk1NpIqYhOedOjp";

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_pSk3Endw49XCedzJyt0GYVBE",
      // content: "Why is Creigh an asshole?",
    });
    res.json({ runId: run.id });
  } catch (error) {
    console.error("Error in processing OpenAI request:", error);
    res.status(500).send("Error in processing your request");
  }
});

app.post("/check-run", async (req, res) => {
  try {
    const threadId = "thread_2eL4gJeL3Wk1NpIqYhOedOjp";
    //const runId = "run_gFnxlt1NZOd4yv5NC1iKc5wl";
    const runId = req.body.runId;

    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    res.json({ status: run.status });
  } catch (error) {
    console.error("Error in processing OpenAI request:", error);
    res.status(500).send("Error in processing your request");
  }
});

app.get("/get-message", async (req, res) => {
  try {
    const threadId = "thread_2eL4gJeL3Wk1NpIqYhOedOjp";

    // const messages = await openai.beta.threads.messages.list(threadId);
    // console.log(messages.data[0]);
    // res.json({ messages: messages.data[0] });
    // Retrieve messages from the thread
    const response = await openai.beta.threads.messages.list(threadId);

    console.log(response.data[0].content);

    // Filter messages to get the last one sent by the assistant
    const assistantMessages = response.data.filter(
      (message) => message.role === "assistant"
    );
    const lastAssistantMessage =
      assistantMessages[assistantMessages.length - 1];

    res.json({ lastMessage: response.data[0].content[0].text.value });
  } catch (error) {
    console.error("Error in processing OpenAI request:", error);
    res.status(500).send("Error in processing your request");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
