exports = async function (request) {
    // This MongoDB function increments the likes count for a specific document by ID
    // If the document does not exist, it will be upserted with an initial likes count of 1
    // The document ID must be exactly 32 characters long

    var documentId = request.body.text();

    // Validate the document ID length
    if (documentId.length !== 32) {
        return { error: "failed" };
    }

    // Find the name of the MongoDB service you want to use (see "Linked Data Sources" tab)
    var serviceName = "Default-Cluster";

    // Update these to reflect your db/collection
    var dbName = "Memes";
    var collName = "Likes";

    // Get a collection from the context
    var collection = context.services.get(serviceName).db(dbName).collection(collName);

    var updateResult;
    try {
        // Execute an updateOne with upsert true
        updateResult = await collection.updateOne(
            { _id: documentId }, // filter by document ID
            { $inc: { likes: 1 } }, // increment the 'likes' field by 1
            { upsert: true } // upsert option set to true
        );
    } catch (err) {
        console.log("Error occurred while executing updateOne:", err.message);

        return { error: "failed" };
    }

    return { result: "success" };
};
