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

    const dao = new Dao(db);
    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("Ratings");
    return dao.deleteCollection(collection);
  },
);
