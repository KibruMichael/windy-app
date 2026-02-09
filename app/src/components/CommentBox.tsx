import React, { useEffect, useState } from "react";
import pbClient from "../lib/pbClient";
import { useAuth } from "../hooks/useAuth";
import { MessageSquare, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

interface CommentBoxProps {
  currentLocation?: string;
  onSelectLocation?: (lat: number, lon: number) => void;
}

interface Comment {
  id: string;
  commentText: string;
  mapLocation: string;
  user: string;
  created: string;
  expand?: {
    user?: {
      id: string;
      name?: string;
      email?: string;
    };
  };
}

const CommentBox: React.FC<CommentBoxProps> = ({
  currentLocation,
  onSelectLocation,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [mapLocation, setMapLocation] = useState(currentLocation || "Unknown");

  useEffect(() => {
    if (currentLocation) {
      setMapLocation(currentLocation);
    }
  }, [currentLocation]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await pbClient.getComments(50);
        setComments(res as Comment[]);
      } catch (e) {
        console.error("Failed to fetch comments", e);
      }
    };
    fetchComments();
    
    const unsub = pbClient.subscribeComments((e: any) => {
      if (e.action === "create") setComments((prev) => [e.record as Comment, ...prev]);
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const handleLocationClick = (loc: string) => {
    if (!onSelectLocation) return;
    const parts = loc.split(",").map((p) => p.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon)) {
        if (lat < -90 || lat > 90) {
          onSelectLocation(lon, lat);
        } else {
          onSelectLocation(lat, lon);
        }
      }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please sign in");
      return;
    }
    if (!commentText.trim()) return;
    try {
      // optimistic local add (will also be added via realtime)
      const temp: Comment = {
        id: `temp-${Date.now()}`,
        commentText,
        mapLocation: mapLocation || "General",
        user: user.id,
        created: new Date().toISOString(),
        expand: { user: { id: user.id, name: user.name || user.email } },
      };
      setComments((prev) => [temp, ...prev]);

      await pbClient.createComment(
        commentText,
        mapLocation || "General",
        user.id
      );
      setCommentText("");
      toast.success("Comment posted");
    } catch (err: any) {
      console.error("Create comment error:", err);
      const msg =
        (err && err.data && err.data.message) ||
        (err && err.message) ||
        JSON.stringify(err);
      toast.error(msg || "Failed to create comment.");
      // remove optimistic temp if failure
      setComments((prev) => prev.filter((c) => !c.id?.startsWith("temp-")));
    }
  };

  return (
    <div className="comment-box">
      <h4>
        <MessageSquare size={16} /> Comments
      </h4>
      <form onSubmit={submit}>
        <div style={{ position: "relative" }}>
          <MapPin
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "12px",
              color: "#a6b3d0",
            }}
          />
          <input
            type="text"
            placeholder="Location"
            value={mapLocation}
            onChange={(e) => setMapLocation(e.target.value)}
            style={{ paddingLeft: "30px" }}
          />
        </div>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={user ? "Share feedback..." : "Sign in to comment"}
          rows={3}
        />
        <button type="submit">Post Comment</button>
      </form>

      <div className="comments-list">
        {comments.map((c) => {
          const createdDate = new Date(c.created);
          if (isNaN(createdDate.getTime())) return null;

          const isCoords = c.mapLocation?.includes(",");
          const displayName =
            c.expand?.user?.name || c.expand?.user?.email || "User";

          return (
            <div key={c.id} className="comment-item">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <strong style={{ fontSize: "0.85rem", color: "#00f0ff" }}>
                  {displayName}
                </strong>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#a6b3d0",
                    cursor: isCoords ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                  onClick={() => handleLocationClick(c.mapLocation)}
                  title={isCoords ? "Jump to location" : ""}
                >
                  <MapPin size={10} /> {c.mapLocation}
                  {isCoords && (
                    <Navigation size={10} style={{ marginLeft: "2px" }} />
                  )}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#E0E0E0",
                  lineHeight: "1.4",
                }}
              >
                {c.commentText}
              </div>
              <div
                style={{ fontSize: "0.7rem", color: "#666", marginTop: "4px" }}
              >
                {createdDate.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentBox;
