const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// 9.1: return the number of books
exports.countBooks = onRequest((req, res) => {
  cors(req, res, async () => {
    const snap = await admin.firestore().collection("books").count().get();
    res.json({ count: snap.data().count });
  });
});

// 9.2: capitalise every string field when a book is added
exports.capitaliseBook = onDocumentCreated("books/{bookId}", async (event) => {
  const data = event.data.data();
  const updated = {};
  for (const [key, value] of Object.entries(data)) {
    updated[key] = typeof value === "string" ? value.toUpperCase() : value;
  }
  await event.data.ref.update(updated);
});