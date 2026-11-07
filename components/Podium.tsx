import type { Division } from "@/content/site";

export function Podium({ d, eyebrow }: { d: Division; eyebrow?: string }) {
  return (
    <div>
      <p className="uso-eyebrow" style={{ marginBottom: 10 }}>{eyebrow ? `${eyebrow} · ` : ""}{d.title}</p>
      <ol className="uso-podium" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {d.placings.map((p) => (
          <li key={p.team} className={`uso-podium__item${p.place === 1 ? " uso-podium__item--1" : ""}`}>
            <span className="uso-podium__place" aria-label={p.place ? `Place ${p.place}` : undefined}>{p.place ?? ""}</span>
            <div><div className="uso-podium__team">{p.team}</div>{p.label && <div className="uso-podium__label">{p.label}</div>}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
