exports = async function () {
  // Slow queries

  const dedicated = context.services.get('Demo-Cluster');
  const serverless = context.services.get('Demo-Serverless');
  const shared = context.services.get('Demo-Shared');

  while (true) {
    pickRandomQuery = Math.floor(Math.random() * 4);
    
    switch (pickRandomQuery) {
      case 0:
        // airbnb query
        console.log('running airbnb query');

        pickRandomCluster = Math.floor(Math.random() * 2);
        cluster = [dedicated, serverless][pickRandomCluster];
        db = cluster.db("sample_airbnb");

        queryTermList = ["home", "new", "charming", "cosy"];
        queryTerm = queryTermList[Math.floor(Math.random() * queryTermList.length)];
        query = { description: { $regex: `.*${queryTerm}.*`, $options: "i" }, };
        sort = {};
        sort[queryTerm] = 1;

        res = await db.collection("listingsAndReviews").find(query).sort(sort);
        console.log('executed');
        break;
      case 1:
        // grades query
        console.log('running grades query');

        pickRandomCluster = Math.floor(Math.random() * 1);
        cluster = [dedicated][pickRandomCluster];
        db = cluster.db("sample_training");

        queryTermList = ["exam", "quiz", "homework"];
        queryTerm = queryTermList[Math.floor(Math.random() * queryTermList.length)];
        query = { "scores.type": queryTerm };
        sort = { student_id: 1, class_id: 1 };

        res = await db.collection("grades").find(query).sort(sort);
        console.log('executed');
        break;
      case 2:
        // mflix query
        console.log('running movies query');

        pickRandomCluster = Math.floor(Math.random() * 2);
        cluster = [dedicated, serverless][pickRandomCluster];
        db = cluster.db("sample_mflix");

        queryFieldList = ["plot", "title", "fullplot"];
        queryTermList = ["hero", "drama", "disaster", "horror"];
        queryField = queryFieldList[Math.floor(Math.random() * queryFieldList.length)];
        queryTerm = queryTermList[Math.floor(Math.random() * queryTermList.length)];
        query = {};
        query[queryField] = { $regex: `.*${queryTerm}.*`, $options: "i" };
        sort = {};
        sort[queryTerm] = 1;

        res = await db.collection("movies").find(query).sort(sort);
        console.log('executed');
        break;
      case 3:
        // weather data query
        console.log('running weather query');

        pickRandomCluster = Math.floor(Math.random() * 2);
        cluster = [dedicated, serverless][pickRandomCluster];
        db = cluster.db("sample_weatherdata");

        queryList = [{ type: "FM-13" }, { callLetters: { $ne: "SHIP" } }];
        sortByList = [{ callLetters: 1 }, { callLetters: 1, qualityControlProcess: 1 }, { callLetters: 1, qualityControlProcess: 1, elevation: -1 }];
        matchQuery = queryList[Math.floor(Math.random() * queryList.length)];
        sortBy = sortByList[Math.floor(Math.random() * sortByList.length)];

        pipeline = [
          { $match: matchQuery },
          { $sort: sortBy }
        ];

        res = await db.collection("data").aggregate(pipeline, { allowDiskUse: true });
        console.log('executed');
        break;
    }
  }
};
