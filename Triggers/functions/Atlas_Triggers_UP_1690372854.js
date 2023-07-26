exports = async function () {
  // Unpause cluster

  try {
    const username = context.values.get("AtlasPublicKey");
    const password = context.values.get("AtlasPrivateKey");
    const projectId = '620531240191d10e7accbff5';
    const clusterName = 'Demo-Cluster';

    const body = { paused: false };

    const arg = {
      scheme: 'https',
      host: 'cloud.mongodb.com',
      path: 'api/atlas/v1.0/groups/' + projectId + '/clusters/' + clusterName,
      username: username,
      password: password,
      headers: { 'Content-Type': ['application/json'], 'Accept-Encoding': ['bzip, deflate'] },
      digestAuth: true,
      body: JSON.stringify(body)
    };

    response = await context.http.patch(arg);
    console.log(response.body.text());
  }
  catch (e) {
    console.error(e);
  }
};