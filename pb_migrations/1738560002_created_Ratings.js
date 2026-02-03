migrate(
  (db) => {
    const collection = new Collection({
      id: "ratings_collection",
      name: "Ratings",
      type: "base",
      schema: [
        {
          id: "value_field",
          name: "value",
          type: "number",
          required: true,
          options: {
            min: 1,
            max: 5,
          },
        },
        {
          id: "user_field",
          name: "user",
          type: "relation",
          required: true,
          options: {
            collectionId: "_pb_users_auth_",
            cascadeDelete: true,
          },
        },
      ],
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.id != null",
      updateRule: "user = @request.auth.id",
      deleteRule: "user = @request.auth.id",
    });

    return db.saveCollection(collection);
  },
  (db) => {
    const collection = db.findCollectionByNameOrId("Ratings");
    return db.deleteCollection(collection);
  },
);
