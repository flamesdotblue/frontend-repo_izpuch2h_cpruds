import React, { useMemo } from 'react';

const SHOT_TYPES = {
  layup: { label: 'Terzo tempo', points: 2 },
  two: { label: 'Tiro da 2', points: 2 },
  three: { label: 'Tiro da 3', points: 3 },
  freeThrow: { label: 'Tiro libero', points: 1 },
};

export default function StatsPanel({ events, roster, athletesById }) {
  const stats = useMemo(() => {
    const base = {};
    roster.forEach((id) => {
      base[id] = {
        name: athletesById[id]?.name || '—',
        points: 0,
        fouls: 0,
        attempts: { layup: 0, two: 0, three: 0, freeThrow: 0 },
        made: { layup: 0, two: 0, three: 0, freeThrow: 0 },
      };
    });
    events.forEach((e) => {
      if (!base[e.athleteId]) return; // only count for current roster
      if (e.type === 'foul') {
        base[e.athleteId].fouls += 1;
      } else if (SHOT_TYPES[e.type]) {
        base[e.athleteId].attempts[e.type] += 1;
        if (e.made) {
          base[e.athleteId].made[e.type] += 1;
          base[e.athleteId].points += SHOT_TYPES[e.type].points;
        }
      }
    });
    return base;
  }, [events, roster, athletesById]);

  const rows = Object.entries(stats)
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <h3 className="font-semibold mb-3">Statistiche</h3>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-4">Atleta</th>
              <th className="py-2 pr-4 text-right">Pts</th>
              <th className="py-2 pr-4 text-right">Fouls</th>
              <th className="py-2 pr-4 text-right">Layup</th>
              <th className="py-2 pr-4 text-right">2PT</th>
              <th className="py-2 pr-4 text-right">3PT</th>
              <th className="py-2 pr-4 text-right">TL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4">{r.name}</td>
                <td className="py-2 pr-4 text-right font-semibold">{r.points}</td>
                <td className="py-2 pr-4 text-right">{r.fouls}</td>
                <td className="py-2 pr-4 text-right">{r.made.layup}/{r.attempts.layup}</td>
                <td className="py-2 pr-4 text-right">{r.made.two}/{r.attempts.two}</td>
                <td className="py-2 pr-4 text-right">{r.made.three}/{r.attempts.three}</td>
                <td className="py-2 pr-4 text-right">{r.made.freeThrow}/{r.attempts.freeThrow}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={7}>Seleziona la rosa convocata per iniziare a tracciare.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
