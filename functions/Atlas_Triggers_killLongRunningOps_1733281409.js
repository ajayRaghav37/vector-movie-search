exports = async function() {
  // A Scheduled Trigger will always call a function without arguments.
  // Documentation on Triggers: https://www.mongodb.com/docs/atlas/atlas-ui/triggers

  // Functions run by Triggers are run as System users and have full access to Services, Functions, and MongoDB Data.

  // Get the MongoDB service you want to use (see "Linked Data Sources" tab)
  const serviceName = "Demo-Cluster";
  console.log(context.services.get(serviceName).db("sample_mflix").findOne({}));
};
