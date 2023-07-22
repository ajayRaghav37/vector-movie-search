async function getEmbedding(query, key) {
  // Define the OpenAI API url and key.
  try {
    const url = 'https://api.openai.com/v1/embeddings';

    let response = await context.http.post({
      url: url,
      headers: {
        'Authorization': [`Bearer ${key}`],
        'Content-Type': ['application/json']
      },
      body: JSON.stringify({
        // The field inside your document that contains the data to embed, here it is the “plot” field from the sample movie data.
        input: query,
        model: "text-embedding-ada-002"
      })
    });

    // Parse the JSON response
    console.log(response.body.text());
    return EJSON.parse(response.body.text()).data[0].embedding;

  }
  catch (e) {
    console.error(e);
  }
}

async function findSimilarDocuments(embedding) {
  const mongodb = context.services.get('Vector');
  const db = mongodb.db('sample_mflix'); // Replace with your database name.
  const collection = db.collection('movies'); // Replace with your collection name.

  try {
    // Query for similar documents.
    const documents = await collection.aggregate([
      {
        "$search": {
          "index": "default",
          "knnBeta": {
            "vector": embedding,
            "path": "plot_embedding",
            "k": 5
          }
        }
      },
      {
        "$project": {
          title: 1,
          plot: 1,
          poster: 1,
          fullplot: 1,
          year: 1,
          countries: 1,
          languages: 1,
          score: { $meta: 'searchScore' },
          "imdb.rating": 1
        }
      }
    ]).toArray();

    return documents;
  }
  catch (e) {
    console.error(e);
  }
}

async function findDocuments(q) {
  const mongodb = context.services.get('Vector');
  const db = mongodb.db('sample_mflix'); // Replace with your database name.
  const collection = db.collection('movies'); // Replace with your collection name.

  try {
    // Query for similar documents.
    const documents = await collection.aggregate([
      {
        "$search": {
          "index": "default",
          "compound": {
            "must": [
              {
                "exists": {
                  "path": "plot_embedding"
                }
              },
              {
                "text": {
                  "query": q,
                  "path": "plot"
                }
              }
            ]
          }
        }
      },
      {
        "$limit": 5
      },
      {
        "$project": {
          title: 1,
          plot: 1,
          poster: 1,
          fullplot: 1,
          year: 1,
          countries: 1,
          languages: 1,
          score: { $meta: 'searchScore' },
          "imdb.rating": 1
        }
      }
    ]).toArray();

    return documents;
  }
  catch (e) {
    console.error(e);
  }
}

// This function is the endpoint's request handler.
exports = async function ({ query, headers, body }, response) {
  const { s, m, key } = query;

  try {
    if (m === "Standard") {
      const docs = await findDocuments(s);

      return { results: docs };
    }

    const embedding = await getEmbedding(s, key);
    const documents = await findSimilarDocuments(embedding);

    return { results: documents };
  } catch (err) {
    console.error(err);
    return [err];
  }
};
