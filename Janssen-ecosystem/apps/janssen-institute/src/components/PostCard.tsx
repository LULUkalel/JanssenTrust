export function PostCard({ p }: { p: any }) {
  return (
    <article className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="font-semibold text-lg">{p.title}</h3>

      {p.link_url && (
        <p className="mt-2">
          <a
            className="underline text-blue-300 break-all"
            href={p.link_url}
            target="_blank"
          >
            Lien
          </a>
        </p>
      )}

      {p.media_url && (
        <img
          src={p.media_url}
          className="mt-3 rounded-xl w-full h-auto"
          alt="post"
        />
      )}

      {p.content && (
        <p className="mt-3 text-white/80 text-sm whitespace-pre-wrap">{p.content}</p>
      )}

      <div className="mt-4 text-xs text-white/50 flex justify-between">
        <span>{new Date(p.created_at).toLocaleString("fr-BE")}</span>
        <span>{p.author ?? "—"}</span>
      </div>
    </article>
  );
}
