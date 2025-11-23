"use client";

import Image from "next/image";

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  streams: number;
}

const SAMPLE_MEDIA: MediaItem[] = [
  {
    id: "1",
    title: "Neon Dreams",
    artist: "Freezzo",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    streams: 125000,
  },
  {
    id: "2",
    title: "Electric Pulse",
    artist: "OBMB",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop",
    streams: 89000,
  },
  {
    id: "3",
    title: "Midnight Echo",
    artist: "Juno",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    streams: 234000,
  },
  {
    id: "4",
    title: "Solar Flare",
    artist: "Nova",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    streams: 567000,
  },
];

export default function MediaGrid() {
  return (
    <div className="bg-dmf-accent rounded-lg p-6">
      <h2 className="text-2xl font-bold text-dmf-secondary mb-6">Artist Roster</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SAMPLE_MEDIA.map((item) => (
          <div key={item.id} className="bg-dmf-primary rounded-lg overflow-hidden hover:scale-105 transition">
            <div className="relative w-full pb-100">
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-dmf-secondary">{item.title}</h3>
              <p className="text-sm text-gray-300">{item.artist}</p>
              <p className="text-xs text-gray-400 mt-2">{item.streams.toLocaleString()} streams</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
