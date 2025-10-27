import React, { useMemo } from 'react';

export default function StatsPanel({ schedule, athletesByGroup, matchStatsById }) {
  const items = useMemo(() => {
    return schedule.map(m => {
      const stats = matchStatsById[m.id] || { perPlayer: {}, events: [] };
      // Build per-player with athlete info
      const players = Object.entries(stats.perPlayer).map(([pid, st]) => {
        const athlete = (athletesByGroup[m.group] || []).find(a=>a.id===pid);
        const attempts = st.attempts || 0;
        const made = st.made || 0;
        const points = st.points || 0;
        const fouls = st.fouls || 0;
        const voto = attempts > 0 ? (made / attempts) : 0;
        return { id: pid, athlete, attempts, made, points, fouls, voto };
      }).sort((a,b)=> b.points - a.points);

      const totalHome = players.reduce((acc, p)=> acc + p.points, 0);
      const totalAway = 0; // placeholder if you later track per-team; for now use home roster points only

      return { match: m, players, totalHome, totalAway };
    });
  }, [schedule, athletesByGroup, matchStatsById]);

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
        <h2 className="text-xl font-semibold mb-2">Statistiche Match</h2>
        <p className="text-sm text-gray-600">Classifiche punti e rapporto realizzazioni/tiri ("voto"). Puoi usare questa vista a fine partita.</p>
      </div>

      {items.length === 0 && (
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow text-sm text-gray-500">Nessun match disponibile.</div>
      )}

      <div className="space-y-6">
        {items.map(({ match, players, totalHome }) => (
          <div key={match.id} className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">{match.home} vs {match.away} • {match.group}</div>
                <div className="text-xs text-gray-500">{new Date(match.date).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{totalHome}</div>
                <div className="text-xs text-gray-500">Punti totali (rosa selezionata)</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2">Giocatore</th>
                    <th className="py-2">Punti</th>
                    <th className="py-2">Tiri</th>
                    <th className="py-2">Canestri</th>
                    <th className="py-2">Voto</th>
                    <th className="py-2">Falli</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {players.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-3 text-gray-500">Nessun dato registrato</td>
                    </tr>
                  )}
                  {players.map(p => (
                    <tr key={p.id}>
                      <td className="py-2">
                        {p.athlete ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{p.athlete.number}</span>
                            <span className="font-medium">{p.athlete.name}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-2 font-semibold">{p.points}</td>
                      <td className="py-2">{p.attempts}</td>
                      <td className="py-2">{p.made}</td>
                      <td className="py-2">{(p.voto * 100).toFixed(0)}%</td>
                      <td className="py-2">{p.fouls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
