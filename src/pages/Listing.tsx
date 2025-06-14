import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

interface Bridge {
  id: number;
  created_at: string;
  title: string;
  note?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

export default function Listing() {
  const [match, params] = useRoute("/listing/:id");
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !params?.id) {
      setLoading(false); // Set loading to false if no match or params.id
      return;
    }

    const fetchBridge = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("bridges")
          .select("*")
          .eq("id", params.id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }
        setBridge(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching bridge:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBridge();
  }, [match, params?.id]); // Changed params to params.id in dependency array

  if (loading) return <div>Loading...</div>; // Moved loading check before !match
  if (!match) return null;
  if (error) return <div>Error: {error}</div>;
  if (!bridge) return <div>Bridge not found.</div>;

  return (
    <div>
      <h1>{bridge.title}</h1>
      <p>ID: {bridge.id}</p>
      <p>Created At: {new Date(bridge.created_at).toLocaleString()}</p>
      {bridge.note && <p>Note: {bridge.note}</p>}
      <p>Latitude: {bridge.latitude}</p>
      <p>Longitude: {bridge.longitude}</p>
      {bridge.image_url && (
        <div>
          <p>Image:</p>
          <img
            src={bridge.image_url}
            alt={bridge.title}
            style={{ maxWidth: "300px" }}
          />
        </div>
      )}
    </div>
  );
}
