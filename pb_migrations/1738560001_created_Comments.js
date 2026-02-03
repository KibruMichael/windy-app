migrate(
  (db) => {
    const collection = new Collection({
      id: "comments_collection",
      name: "Comments",
      type: "base",
      schema: [
        {
          id: "commentText_field",
          name: "commentText",
          type: "text",
          required: true,
        },
        {
          id: "mapLocation_field",
          name: "mapLocation",
          type: "text",
          required: false,
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
    const collection = dao.findCollectionByNameOrId("Comments");
    return dao.deleteCollection(collection);
  },
);
