import pb, { PB_URL } from "./pocketbase";

const authHeader = (): Record<string, string> => {
  const token = (pb.authStore.token as string) || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============ COMMENTS ============

export const getComments = async (limit = 50) => {
  try {
    return await pb
      .collection("Comments")
      .getFullList({ 
        sort: "-created", 
        expand: "user",
        requestKey: null // prevent auto-cancellation
      });
  } catch (e) {
    console.error("getComments SDK error, falling back to REST:", e);
    const res = await fetch(
      `${PB_URL}/api/collections/Comments/records?perPage=${limit}&sort=-created&expand=user`,
      {
        headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
      },
    );
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && data.items) return data.items;
    return [];
  }
};

export const createComment = async (commentText: string, mapLocation: string, userId: string) => {
  try {
    return await pb.collection("Comments").create({
      commentText,
      mapLocation: mapLocation || "General",
      user: userId, // Single relation - send as string, not array
    });
  } catch (e) {
    console.error("createComment SDK error, falling back to REST:", e);
    const res = await fetch(`${PB_URL}/api/collections/Comments/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
      body: JSON.stringify({
        commentText,
        mapLocation: mapLocation || "General",
        user: userId, // Single relation - send as string, not array
      }),
    });
    return res.json();
  }
};

export const subscribeComments = (cb: (e: any) => void) => {
  let unsubscribe: (() => void) | null = null;
  
  const subscribe = async () => {
    try {
      unsubscribe = await pb.collection("Comments").subscribe("*", (e) => {
        cb(e);
      });
    } catch (e) {
      console.error("Failed to subscribe to Comments:", e);
    }
  };
  
  subscribe();
  
  return () => {
    if (unsubscribe) {
      pb.collection("Comments").unsubscribe("*");
    }
  };
};

// ============ FAVORITES ============

export const getFavorites = async (userId: string) => {
  try {
    return await pb
      .collection("Favorites")
      .getFullList({ 
        filter: `user = "${userId}"`, 
        sort: "-created",
        requestKey: null
      });
  } catch (e) {
    console.error("getFavorites SDK error, falling back to REST:", e);
    const res = await fetch(
      `${PB_URL}/api/collections/Favorites/records?filter=${encodeURIComponent(`user = "${userId}"`)}&sort=-created`,
      {
        headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
      },
    );
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && data.items) return data.items;
    return [];
  }
};

export const createFavorite = async (locationName: string, coordinates: string, userId: string) => {
  try {
    return await pb.collection("Favorites").create({
      locationName,
      coordinates,
      user: userId, // Single relation - send as string, not array
    });
  } catch (e) {
    console.error("createFavorite SDK error, falling back to REST:", e);
    const res = await fetch(`${PB_URL}/api/collections/Favorites/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
      body: JSON.stringify({
        locationName,
        coordinates,
        user: userId, // Single relation - send as string, not array
      }),
    });
    return res.json();
  }
};

export const deleteFavorite = async (id: string) => {
  try {
    return await pb.collection("Favorites").delete(id);
  } catch (e) {
    console.error("deleteFavorite SDK error, falling back to REST:", e);
    const res = await fetch(
      `${PB_URL}/api/collections/Favorites/records/${id}`,
      {
        method: "DELETE",
        headers: { ...authHeader() } as HeadersInit,
      },
    );
    return res.json();
  }
};

export const subscribeFavorites = (userId: string, cb: (e: any) => void) => {
  let unsubscribe: (() => void) | null = null;
  
  const subscribe = async () => {
    try {
      unsubscribe = await pb.collection("Favorites").subscribe("*", (e) => {
        // Filter events to only this user's favorites
        if (e.record && e.record.user === userId) {
          cb(e);
        }
      });
    } catch (e) {
      console.error("Failed to subscribe to Favorites:", e);
    }
  };
  
  subscribe();
  
  return () => {
    if (unsubscribe) {
      pb.collection("Favorites").unsubscribe("*");
    }
  };
};

// ============ RATINGS ============

export const getRatings = async () => {
  try {
    return await pb.collection("Ratings").getFullList({
      requestKey: null
    });
  } catch (e) {
    console.error("getRatings SDK error, falling back to REST:", e);
    const res = await fetch(
      `${PB_URL}/api/collections/Ratings/records?perPage=100`,
      {
        headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
      },
    );
    return res.json();
  }
};

export const createOrUpdateRating = async (userId: string, value: number) => {
  try {
    // First check if user already has a rating
    const existing = await pb
      .collection("Ratings")
      .getFirstListItem(`user = "${userId}"`, {
        requestKey: null
      });
    
    // Update existing rating
    if (existing) {
      return await pb.collection("Ratings").update(existing.id, { value });
    }
  } catch (e) {
    // getFirstListItem throws if not found - that's expected
    console.log("No existing rating found, creating new one");
  }
  
  // Create new rating
  try {
    return await pb.collection("Ratings").create({
      value,
      user: userId, // Single relation - send as string, not array
    });
  } catch (e) {
    console.error("createRating SDK error, falling back to REST:", e);
    // Fallback to REST
    const listRes = await fetch(
      `${PB_URL}/api/collections/Ratings/records?filter=${encodeURIComponent(`user = "${userId}"`)}`,
      {
        headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
      },
    );
    const list = await listRes.json();
    
    if (list && list.items && list.items.length > 0) {
      // Update existing
      const id = list.items[0].id;
      const res = await fetch(
        `${PB_URL}/api/collections/Ratings/records/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
          body: JSON.stringify({ value }),
        },
      );
      return res.json();
    }
    
    // Create new
    const res = await fetch(`${PB_URL}/api/collections/Ratings/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
      body: JSON.stringify({ value, user: userId }),
    });
    return res.json();
  }
};

export default {
  getComments,
  createComment,
  subscribeComments,
  getFavorites,
  createFavorite,
  deleteFavorite,
  subscribeFavorites,
  getRatings,
  createOrUpdateRating,
};
