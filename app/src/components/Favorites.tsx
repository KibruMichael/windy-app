import React, { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import { useAuth } from "../hooks/useAuth";
import { Star, Trash2 } from "lucide-react";

interface Favorite {
  id: string;
  locationName: string;
  coordinates: string;
  user: string;
}

const Favorites: React.FC<{ onSelect: (lat: number, lon: number) => void }> = ({ onSelect }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      try {
        const records = await pb.collection("favorites").getFullList<Favorite>({
          filter: `user = "${user.id}"`,
          sort: "-created",
        });
        setFavorites(records);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();

    // Subscribe to realtime changes
    pb.collection("favorites").subscribe("*", (e) => {
      if (e.action === "create") {
        setFavorites((prev) => [e.record as unknown as Favorite, ...prev]);
      } else if (e.action === "delete") {
        setFavorites((prev) => prev.filter((f) => f.id !== e.record.id));
      }
    });

    return () => {
      pb.collection("favorites").unsubscribe("*");
    };
  }, [user]);

  const removeFavorite = async (id: string) => {
    try {
      await pb.collection("favorites").delete(id);
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };

  if (!user || favorites.length === 0) return null;

  return (
    <div className="favorites-box" style={{ marginTop: "20px", marginBottom: "20px" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#A6B3D0", marginBottom: "10px" }}>
        <Star size={16} fill="#FFD700" color="#FFD700" /> Saved Locations
      </h3>
      <div className="favorites-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {favorites.map((fav) => {
          const [lat, lon] = fav.coordinates.split(",").map(Number);
          return (
            <div
              key={fav.id}
              className="favorite-item"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => onSelect(lat, lon)}
            >
              <span style={{ fontSize: "0.85rem", color: "#E0E0E0" }}>{fav.locationName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(fav.id);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff4d4d",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Favorites;
