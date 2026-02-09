import React, { useEffect, useState } from "react";
import pbClient from "../lib/pbClient";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

interface RatingRecord {
  id: string;
  value: number;
  user: string;
}

const Rating: React.FC = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [avg, setAvg] = useState<number | null>(null);

  useEffect(() => {
    const fetchAvg = async () => {
      try {
        const list = await pbClient.getRatings() as RatingRecord[];
        if (list && list.length) {
          const sum = list.reduce((s, r) => s + (r.value || 0), 0);
          setAvg(sum / list.length);
        }
      } catch (e) {
        console.error("Failed to fetch ratings", e);
      }
    };
    fetchAvg();
  }, []);

  const submit = async (v: number) => {
    if (!user) {
      toast.info("Sign in to rate");
      return;
    }
    try {
      await pbClient.createOrUpdateRating(user.id, v);
      setRating(v);
      const list = await pbClient.getRatings() as RatingRecord[];
      const sum = list.reduce((s, r) => s + (r.value || 0), 0);
      setAvg(sum / list.length);
      toast.success("Thanks for rating");
    } catch (err: any) {
      console.error("Create rating error:", err);
      const msg =
        (err && err.data && err.data.message) ||
        (err && err.message) ||
        JSON.stringify(err);
      toast.error(msg || "Failed to create rating.");
    }
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
