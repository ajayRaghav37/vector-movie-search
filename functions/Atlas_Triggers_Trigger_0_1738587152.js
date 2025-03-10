/*
 * Retrieve information about a cluster.
 * Documentation: https://www.mongodb.com/docs/atlas/reference/api-resources-spec/#tag/Clusters/operation/getLegacyCluster
 */

exports = async function() {
  const projectID = '66daa68d7eec3f170fcbd0d4';  // Your project ID
  const clusterName = 'Audience-NP-QA';           // Your cluster name
  const targetInstanceSize = "M30";
  const targetIOPS = 1250;

  try {
    // Step 1: Retrieve the cluster configuration
    const clusterConfig = await getClusterConfig(projectID, clusterName ,context);
    console.log('Cluster Config:', JSON.stringify(clusterConfig));

    if (clusterConfig) {
      // Step 2: Modify the replicationSpecs to update diskIOPS
      const newRs = clusterConfig.replicationSpecs.map(rs => {
        rs.regionConfigs = rs.regionConfigs.map(rc => {
          rc.priority = rc.priority.toString();

          rc.electableSpecs.diskIOPS = targetIOPS.toString();
          rc.electableSpecs.instanceSize = targetInstanceSize;
          rc.electableSpecs.diskSizeGB = rc.electableSpecs.diskSizeGB.toString();
          rc.electableSpecs.nodeCount = rc.electableSpecs.nodeCount.toString();
          
          rc.analyticsSpecs.diskIOPS = targetIOPS.toString();
          rc.analyticsSpecs.instanceSize = targetInstanceSize;
          rc.analyticsSpecs.diskSizeGB = rc.analyticsSpecs.diskSizeGB.toString();
          rc.analyticsSpecs.nodeCount = rc.analyticsSpecs.nodeCount.toString();

          rc.readOnlySpecs.diskIOPS = targetIOPS.toString();
          rc.readOnlySpecs.instanceSize = targetInstanceSize;
          rc.readOnlySpecs.diskSizeGB = rc.readOnlySpecs.diskSizeGB.toString();
          rc.readOnlySpecs.nodeCount = rc.readOnlySpecs.nodeCount.toString();

          return rc;
        });

        return rs;
      });

      // Step 3: Construct the body for the PATCH request
      const body = { replicationSpecs: newRs };

      // Step 4: Modify the cluster with the updated configuration
      const modifyResponse = await modifyCluster(projectID, clusterName, body, context);
      console.log('Cluster Modification Response:', JSON.stringify(modifyResponse));

      return modifyResponse;
    } else {
      throw new Error('Failed to retrieve cluster configuration.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    return { error: error.message };
  }
};

// Function to get the cluster configuration
async function getClusterConfig(projectID, clusterName,context) {
  const arg = {
    scheme: 'https',
    host: 'cloud.mongodb.com',
    path: `/api/atlas/v2/groups/${projectID}/clusters/${clusterName}`,
    username: context.values.get("AtlasPublicKey"),
    password: context.values.get("AtlasPrivateKey"),
    headers: {
      'Accept': ['application/vnd.atlas.2024-08-05+json']
    },
    digestAuth: true
  };

  try {
    console.log('Making GET request with URL:', `https://${arg.host}${arg.path}`);
    const response = await context.http.get(arg);

    // Log the full response for debugging
    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body.text());

    if (response.status !== "200 OK") {
      throw new Error(`Error: Received unexpected status code "${response.status}"`);
    }

    return EJSON.parse(response.body.text());
  } catch (err) {
    console.error('Error occurred while retrieving cluster config:', err.message);
    console.error('Full error:', err);
    throw new Error('Failed to retrieve cluster config.');
  }
}

// Function to modify the cluster configuration
async function modifyCluster(projectID, clusterName, body, context) {
  const AtlasPublicKey = context.values.get("AtlasPublicKey");
  const AtlasPrivateKey = context.values.get("AtlasPrivateKey");

  const arg = {
    scheme: 'https',
    host: 'cloud.mongodb.com',
    path: `/api/atlas/v2/groups/${projectID}/clusters/${clusterName}`,
    username: AtlasPublicKey,
    password: AtlasPrivateKey,
    headers: {
      'Accept': ['application/vnd.atlas.2024-08-05+json'],
      'Content-Type': ['application/json']
    },
    digestAuth: true,
    body: body,
    encodeBodyAsJSON: true
  };

  try {
    console.log("Request body for modification:", JSON.stringify(body));  // Debugging the request body

    const response = await context.http.patch(arg);
    console.log(`Modify Cluster Response Status: ${response.status}`);
    console.log(`Modify Cluster Response Body: ${response.body.text()}`);

    if (response.status !== "200 OK") {
      throw new Error(`Error: Received unexpected status code "${response.status}" with response: ${response.body.text()}`);
    }

    return EJSON.parse(response.body.text());
  } catch (error) {
    console.error('Error occurred while modifying the cluster state:', error.message);
    return { error: 'Failed to modify the cluster state. See logs for details.' };
  }
}