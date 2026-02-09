import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function setupCollections() {
  try {
    // Authenticate as superuser
    console.log('Authenticating...');
    await pb.admins.authWithPassword('kibrumic@gmail.com', 'kibru@12mic');
    console.log('Authenticated successfully!');
    
    // Delete existing collections if they exist
    console.log('Cleaning up existing collections...');
    try {
      const existing = await pb.collections.getFullList();
      for (const col of existing) {
        if (['Comments', 'Favorites', 'Ratings'].includes(col.name)) {
          console.log(`Deleting ${col.name}...`);
          await pb.collections.delete(col.id);
        }
      }
    } catch (e) {
      console.log('No existing collections to delete');
    }

    // Create Comments collection
    console.log('Creating Comments collection...');
    await pb.collections.create({
      name: 'Comments',
      type: 'base',
      fields: [
        {
          name: 'commentText',
          type: 'text',
          required: true,
        },
        {
          name: 'mapLocation',
          type: 'text',
          required: false,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    console.log('✅ Comments collection created!');

    // Create Favorites collection
    console.log('Creating Favorites collection...');
    await pb.collections.create({
      name: 'Favorites',
      type: 'base',
      fields: [
        {
          name: 'locationName',
          type: 'text',
          required: true,
        },
        {
          name: 'coordinates',
          type: 'text',
          required: true,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    console.log('✅ Favorites collection created!');

    // Create Ratings collection
    console.log('Creating Ratings collection...');
    await pb.collections.create({
      name: 'Ratings',
      type: 'base',
      fields: [
        {
          name: 'value',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    console.log('✅ Ratings collection created!');

    console.log('\n========================================');
    console.log('✅ All collections set up successfully!');
    console.log('========================================');
    console.log('\nCollections created with fields:');
    console.log('- Comments: commentText, mapLocation, user');
    console.log('- Favorites: locationName, coordinates, user');
    console.log('- Ratings: value (1-5), user');
    console.log('\nYou can now test the app:');
    console.log('1. Run: cd app && npm run dev');
    console.log('2. Open http://localhost:5173');
    console.log('3. Login with: test@example.com / testpass123');
  } catch (error) {
    console.error('Error:', error);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

setupCollections();
