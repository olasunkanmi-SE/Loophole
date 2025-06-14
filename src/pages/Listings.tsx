import { useEffect, useState } from "react";
import { Link } from "wouter";
import { getBridges } from "../api/client";

interface Bridge {
  id: number;
  created_at: string;
  title: string;
  note?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

export default function Listings() {
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBridges = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBridges();
        setBridges(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching bridges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBridges();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!bridges.length) return <div>No bridges found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Bridges</h1>
      <ul className="space-y-4">
        {bridges.map((bridge) => (
          <li key={bridge.id} className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <Link href={`/listing/${bridge.id}`} className="text-blue-600 hover:underline">
              <h2 className="text-xl font-semibold">{bridge.title}</h2>
            </Link>
            <div className="text-sm text-gray-600 mt-1">
              <p>Latitude: {bridge.latitude}</p>
              <p>Longitude: {bridge.longitude}</p>
            </div>
            {bridge.image_url && (
              <img
                src={bridge.image_url}
                alt={bridge.title}
                className="mt-2 rounded-md max-w-xs w-full h-auto object-cover"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
