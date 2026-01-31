import React, { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import { useAuth } from "../hooks/useAuth";

const CommentBox: React.FC = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await pb
          .collection("comments")
          .getFullList(50, { sort: "-created" });
        setComments(res as any);
      } catch (e) {
        // ignore
      }
    };
    fetchComments();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in");
    try {
      const rec = await pb
        .collection("comments")
        .create({ text, user: user.id });
      setComments((prev) => [rec, ...prev]);
      setText("");
    } catch (e: any) {
      alert(e.message || "Failed");
    }
  };

  return (
    <div className="comment-box">
      <h4>Comments</h4>
      <form onSubmit={submit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? "Share feedback..." : "Sign in to comment"}
          rows={3}
        />
        <button type="submit">Post</button>
      </form>
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <strong>{c.user || "User"}</strong>
            <div>{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentBox;
