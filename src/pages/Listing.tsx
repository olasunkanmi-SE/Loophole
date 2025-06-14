import { useRoute } from "wouter";

export default function Listings() {
  const [match, params] = useRoute("/listing/:id");

  if (!match) return null;

  return <div>Listings Page for ID: {params?.id}</div>;
}