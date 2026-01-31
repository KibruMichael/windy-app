import React, { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import { useAuth } from "../hooks/useAuth";

const CommentBox: React.FC = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [mapLocation, setMapLocation] = useState("Unknown");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await pb
          .collection("comments")
          // Expand the user relation to show the user's email/name if configured
          .getFullList(50, { sort: "-created", expand: "user" });
        setComments(res as any);
      } catch (e) {
        console.error("Failed to fetch comments", e);
      }
    };
    fetchComments();

    // Subscribe to realtime changes
    pb.collection("comments").subscribe("*", function (e) {
      if (e.action === "create") {
        setComments((prev) => [e.record, ...prev]);
      }
    });

    return () => {
      pb.collection("comments").unsubscribe("*");
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in");
    try {
      // Create new record with specific fields based on user request
      await pb.collection("comments").create({
        commentText: commentText,
        mapLocation: mapLocation || "General",
        user: user.id,
      });
      // Realtime subscription will handle the UI update
      setCommentText("");
    } catch (e: any) {
      alert(e.message || "Failed");
    }
  };

  return (
    <div className="comment-box">
      <h4>Comments</h4>
      <form onSubmit={submit}>
        <div style={{ marginBottom: "8px" }}>
          <input
            type="text"
            placeholder="Location (e.g. New York)"
            value={mapLocation}
            onChange={(e) => setMapLocation(e.target.value)}
            className="w-full mb-2 p-1 text-sm bg-gray-700 rounded border border-gray-600"
          />
        </div>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={user ? "Share feedback..." : "Sign in to comment"}
          rows={3}
          style={{ width: "100%" }}
        />
        <button type="submit">Post</button>
      </form>
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <strong>
              {c.expand?.user?.email || c.expand?.user?.username || "User"}
            </strong>{" "}
            <span style={{ fontSize: "0.8em", color: "#aaa" }}>
              @{c.mapLocation}
            </span>
            <div>{c.commentText}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentBox;
