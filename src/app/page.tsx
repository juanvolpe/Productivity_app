import { getTodaysPlaylists } from "@/lib/playlist";
import Link from "next/link";

export default async function Home() {
  const playlists = await getTodaysPlaylists();

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">Today's Playlists</h1>
      
      <div className="space-y-4">
        {playlists.map((playlist) => (
          <Link
            key={playlist.id}
            href={`/playlist/${playlist.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h2 className="text-lg font-semibold">{playlist.name}</h2>
            <p className="text-sm text-gray-600">
              {playlist.tasks.length} tasks
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/playlists"
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        Manage Playlists
      </Link>
    </main>
  );
} 