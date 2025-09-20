import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { PostCard } from "./components/PostCard";

export default function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("category", "crypto")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      setPosts(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Super Yachts — Dernières entrées</h1>
      {loading ? (
        <p className="mt-6 text-white/60">Chargement…</p>
      ) : !posts.length ? (
        <p className="mt-6 text-white/60">Aucune publication.</p>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {posts.map((p) => (
            <PostCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}
