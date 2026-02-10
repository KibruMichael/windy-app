import React, { useEffect, useState } from "react";
import apiClient from "../lib/apiClient";
import { useAuth } from "../hooks/useAuthNew";
import { toast } from "sonner";

interface RatingRecord {
  id: string;
  value: number;
  userId: string;
}

const Rating: React.FC = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [avg, setAvg] = useState<number | null>(null);

  useEffect(() => {
    const fetchAvg = async () => {
      try {
        const list = await apiClient.ratings.getAll();
        if (list && list.length) {
          const sum = list.reduce((s, r) => s + (r.value || 0), 0);
          setAvg(sum / list.length);
          
          // Find user's rating
          const userRating = list.find((r) => r.userId === user?.id);
          if (userRating) {
            setRating(userRating.value);
          }
        }
      } catch (e) {
        console.error("Failed to fetch ratings", e);
      }
    };
    
    if (user) {
      fetchAvg();
    }
  }, [user]);

  const submit = async (v: number) => {
    if (!user) {
      toast.info("Sign in to rate");
      return;
    }
    try {
      await apiClient.ratings.createOrUpdate(v);
      setRating(v);
      
      // Refresh average
      const list = await apiClient.ratings.getAll();
      const sum = list.reduce((s, r) => s + (r.value || 0), 0);
      setAvg(sum / list.length);
      
      toast.success("Thanks for rating");
    } catch (err: any) {
      console.error("Create rating error:", err);
      toast.error(err.message || "Failed to create rating.");
    }
  };

  if (!user) return null;

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
