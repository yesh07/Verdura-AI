"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Market = {
  id: string;
  name: string;
  address: string;
  products: string;
  schedule: string;
  googleLink: string;
};

export default function FreshPage() {
  const [zip, setZip] = useState("");
  const [data, setData] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProduce = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://10.103.233.238:8000/produce-nearby?zip=${zip}`);
      const json = await res.json();
      setData(json.markets);
    } catch (err) {
      console.error("Failed to fetch produce:", err);
    }
    setLoading(false);
  };

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-green-700">🍎 What's Fresh Near You</h1>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter ZIP code"
          value={zip}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZip(e.target.value)}
        />
        <Button onClick={fetchProduce} disabled={!zip || loading}>
          {loading ? "Loading..." : "Find Produce"}
        </Button>
      </div>

      {data.length > 0 && (
        <ul className="space-y-4 pt-4">
          {data.map((market) => (
            <li
              key={market.id}
              className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white"
            >
              <h2 className="text-lg font-semibold text-gray-900">{market.name}</h2>
              <p className="text-sm text-gray-500">{market.address}</p>
              <p className="mt-2 text-sm">{market.products}</p>
              <p className="text-xs text-gray-400">{market.schedule}</p>
              <a
                href={market.googleLink}
                className="text-blue-600 text-sm mt-1 inline-block hover:underline"
                target="_blank"
              >
                View on Google Maps
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
