exports = async function () {
  const openai_key = context.values.get("openAI_value");

  // Get the cluster in MongoDB Atlas.
  const mongodb = context.services.get('Vector');
  const db = mongodb.db('sample_mflix'); // Replace with your database name.
  const collection = db.collection('movies'); // Replace with your collection name.

  try {
    const pendingDocs = await collection.aggregate([{ $match: { plot_embedding: { $exists: false }, plot: { $exists: true } } }, { $sort: { "imdb.rating": -1 } }, { $limit: 3 }]).toArray();

    pendingDocs.forEach(async doc => {
      // Call OpenAI API to get the embeddings.
      const url = 'https://api.openai.com/v1/embeddings';

      let response = await context.http.post({
        url: url,
        headers: {
          'Authorization': [`Bearer ${openai_key}`],
          'Content-Type': ['application/json']
        },
        body: JSON.stringify({
          // The field inside your document that contains the data to embed, here it is the “plot” field from the sample movie data.
          input: doc.plot,
          model: "text-embedding-ada-002"
        })
      });

      // Parse the JSON response
      let responseData = EJSON.parse(response.body.text());

      // Check the response status.
      if (response.statusCode === 200) {
        console.log("Successfully received embedding.");

        const embedding = responseData.data[0].embedding;

        // Update the document in MongoDB.
        const result = await collection.updateOne(
          { _id: doc._id },
          // The name of the new field you’d like to contain your embeddings.
          { $set: { plot_embedding: embedding } }
        );

        if (result.modifiedCount === 1) {
          console.log("Successfully updated the document.");
        } else {
          console.log("Failed to update the document.");
        }
      } else {
        console.log(`Failed to receive embedding. Status code: ${response.statusCode}`);
        
        await collection.updateOne(
          { _id: doc._id },
          // The name of the new field you’d like to contain your embeddings.
          { $set: { plot_embedding: "failed" } }
        );
      }

    });
  } catch (err) {
    console.error(err);
  }
};
