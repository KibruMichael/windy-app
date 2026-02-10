import React, { useEffect, useState } from "react";
import apiClient from "../lib/apiClient";
import { useAuth } from "../hooks/useAuthNew";
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
  userId: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  createdAt: string;
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
        const data = await apiClient.comments.getAll();
        setComments(data);
      } catch (e) {
        console.error("Failed to fetch comments", e);
      }
    };
    
    if (user) {
      fetchComments();
    }
  }, [user]);

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
      const newComment = await apiClient.comments.create(
        commentText,
        mapLocation || "General"
      );
      setComments([newComment, ...comments]);
      setCommentText("");
      toast.success("Comment posted");
    } catch (err: any) {
      console.error("Create comment error:", err);
      toast.error(err.message || "Failed to create comment.");
    }
  };

  if (!user) return null;

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
          placeholder="Share feedback..."
          rows={3}
        />
        <button type="submit">Post Comment</button>
      </form>

      <div className="comments-list">
        {comments.map((c) => {
          const createdDate = new Date(c.createdAt);
          if (isNaN(createdDate.getTime())) return null;

          const isCoords = c.mapLocation?.includes(",");
          const displayName = c.user?.name || c.user?.email || "User";

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
