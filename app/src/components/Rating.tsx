import React, { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import { useAuth } from "../hooks/useAuth";

const Rating: React.FC = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [avg, setAvg] = useState<number | null>(null);

  useEffect(() => {
    const fetchAvg = async () => {
      try {
        const list = await pb.collection("ratings").getFullList(100);
        if (list.length) {
          const sum = list.reduce((s: any, r: any) => s + (r.value || 0), 0);
          setAvg(sum / list.length);
        }
      } catch (e) {}
    };
    fetchAvg();
  }, []);

  const submit = async (v: number) => {
    if (!user) return alert("Sign in to rate");
    try {
      await pb.collection("ratings").create({ user: user.id, value: v });
      setRating(v);
      const list = await pb.collection("ratings").getFullList(100);
      const sum = list.reduce((s: any, r: any) => s + (r.value || 0), 0);
      setAvg(sum / list.length);
    } catch (e) {}
  };

  return (
    <div className="rating-box">
      <h4>Rate this app</h4>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            className={`star ${rating === i ? "selected" : ""}`}
            onClick={() => submit(i)}
          >
            {i}★
          </button>
        ))}
      </div>
      {avg != null && (
        <div className="rating-avg">Average: {avg.toFixed(1)} / 5</div>
      )}
    </div>
  );
};

export default Rating;
