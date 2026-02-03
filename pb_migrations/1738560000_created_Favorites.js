migrate(
  (db) => {
    const collection = new Collection({
      id: "favorites_collection",
      name: "Favorites",
      type: "base",
      schema: [
        {
          id: "locationName_field",
          name: "locationName",
          type: "text",
          required: true,
        },
        {
          id: "coordinates_field",
          name: "coordinates",
          type: "text",
          required: true,
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
      listRule: "user = @request.auth.id",
      viewRule: "user = @request.auth.id",
      createRule: "@request.auth.id != null",
      updateRule: "user = @request.auth.id",
      deleteRule: "user = @request.auth.id",
    });

    const dao = new Dao(db);
    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("Favorites");
    return dao.deleteCollection(collection);
  },
);
