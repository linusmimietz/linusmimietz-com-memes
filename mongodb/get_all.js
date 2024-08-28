exports = async function (arg) {
    // This MongoDB function returns all documents from a collection

    // Find the name of the MongoDB service you want to use (see "Linked Data Sources" tab)
    var serviceName = "Default-Cluster";

    // Update these to reflect your db/collection
    var dbName = "Memes";
    var collName = "Likes";

    // Get a collection from the context
    var collection = context.services.get(serviceName).db(dbName).collection(collName);

    var findResults;
    try {
        // Execute a Find in MongoDB and convert the cursor to an array
        findResults = await collection.find({}).toArray();
    } catch (err) {
        console.log("Error occurred while executing find:", err.message);

        return { error: "failed" };
    }

    return { result: findResults };
};
