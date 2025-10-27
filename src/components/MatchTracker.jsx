import React, { useMemo, useState } from 'react';

const PERIODS = ['1°', '2°', '3°', '4°', 'OT'];
const SHOT_TYPES = [
  { key: 'layup', label: 'Terzo tempo', points: 2 },
  { key: 'two', label: 'Tiro da 2', points: 2 },
  { key: 'three', label: 'Tiro da 3', points: 3 },
  { key: 'freeThrow', label: 'Tiro libero', points: 1 },
];

function ensureStats(stats, playerId) {
  if (!stats[playerId]) {
    stats[playerId] = {
      attempts: 0,
      made: 0,
      points: 0,
      fouls: 0,
      breakdown: { layup: { a:0,m:0 }, two: { a:0,m:0 }, three: { a:0,m:0 }, freeThrow: { a:0,m:0 } },
    };
  }
}

export default function MatchTracker({ schedule, athletesByGroup, matchStatsById, onUpdateMatchStats }) {
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [period, setPeriod] = useState('1°');
  const selectedMatch = useMemo(() => schedule.find(m => m.id === selectedMatchId) || null, [schedule, selectedMatchId]);
  const groupAthletes = useMemo(() => {
    if (!selectedMatch) return [];
    return (athletesByGroup[selectedMatch.group] || []).sort((a,b)=> a.number - b.number);
  }, [athletesByGroup, selectedMatch]);

  const current = matchStatsById[selectedMatchId] || { events: [], perPlayer: {} };

  const addEvent = (ev) => {
    if (!selectedMatch) return;
    const next = structuredClone(current);
    next.events.push(ev);
    ensureStats(next.perPlayer, ev.playerId);
    const ps = next.perPlayer[ev.playerId];
    if (ev.type === 'foul') {
      ps.fouls = Math.min(5, ps.fouls + 1);
    } else {
      ps.attempts += 1;
      if (!ps.breakdown[ev.type]) ps.breakdown[ev.type] = { a: 0, m: 0 };
      ps.breakdown[ev.type].a += 1;
      if (ev.result === 'made') {
        ps.made += 1;
        ps.breakdown[ev.type].m += 1;
        ps.points += SHOT_TYPES.find(s=>s.key===ev.type)?.points || 0;
      }
    }
    onUpdateMatchStats(selectedMatchId, next);
  };

  const removeEvent = (index) => {
    if (!selectedMatch) return;
    const next = { events: [], perPlayer: {} };
    const remaining = current.events.filter((_,i)=> i !== index);
    // Recompute perPlayer from scratch to keep it simple and robust
    for (const ev of remaining) {
      ensureStats(next.perPlayer, ev.playerId);
      const ps = next.perPlayer[ev.playerId];
      if (ev.type === 'foul') {
        ps.fouls = Math.min(5, ps.fouls + 1);
      } else {
        ps.attempts += 1;
        if (!ps.breakdown[ev.type]) ps.breakdown[ev.type] = { a: 0, m: 0 };
        ps.breakdown[ev.type].a += 1;
        if (ev.result === 'made') {
          ps.made += 1;
          ps.breakdown[ev.type].m += 1;
          ps.points += SHOT_TYPES.find(s=>s.key===ev.type)?.points || 0;
        }
      }
    }
    next.events = remaining;
    onUpdateMatchStats(selectedMatchId, next);
  };

  const handleShot = (playerId, type, result) => {
    addEvent({ id: crypto.randomUUID(), ts: Date.now(), period, playerId, type, result });
  };

  const handleFoul = (playerId) => {
    addEvent({ id: crypto.randomUUID(), ts: Date.now(), period, playerId, type: 'foul' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Tracciamento Match</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Seleziona Match</label>
            <select value={selectedMatchId} onChange={(e)=>setSelectedMatchId(e.target.value)} className="w-full rounded border px-3 py-2">
              <option value="">— Seleziona —</option>
              {schedule.map(m => (
                <option key={m.id} value={m.id}>{m.group} • {m.home} vs {m.away} • {new Date(m.date).toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tempo</label>
            <select value={period} onChange={(e)=>setPeriod(e.target.value)} className="w-full rounded border px-3 py-2">
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full rounded border px-3 py-2 bg-gray-50 text-sm">
              {selectedMatch ? `${selectedMatch.home} vs ${selectedMatch.away} (${selectedMatch.group})` : 'Nessun match selezionato'}
            </div>
          </div>
        </div>
      </div>

      {selectedMatch && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-3">Roster {selectedMatch.group}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupAthletes.map(a => {
                  const st = current.perPlayer[a.id] || { points: 0, fouls: 0 };
                  const foulLimit = st.fouls >= 5;
                  return (
                    <div key={a.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-semibold">{a.number}</span>
                          <div>
                            <div className="font-medium">{a.name}</div>
                            <div className="text-xs text-gray-500">Falli: {st.fouls}/5 • Punti: {st.points}</div>
                          </div>
                        </div>
                        <button disabled={foulLimit} onClick={()=>handleFoul(a.id)} className={`text-xs px-2 py-1 rounded ${foulLimit? 'bg-gray-200 text-gray-500':'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>Fallo</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {SHOT_TYPES.map(s => (
                          <div key={s.key} className="flex gap-1">
                            <button onClick={()=>handleShot(a.id, s.key, 'made')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2 py-1 text-xs">{s.label} ✓</button>
                            <button onClick={()=>handleShot(a.id, s.key, 'miss')} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded px-2 py-1 text-xs">{s.label} ✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-3">Eventi</h3>
              <ul className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {current.events.length === 0 && (
                  <li className="text-sm text-gray-500">Nessun evento registrato</li>
                )}
                {current.events.map((ev, idx) => {
                  const player = groupAthletes.find(a=>a.id===ev.playerId);
                  const label = ev.type === 'foul' ? 'Fallo' : SHOT_TYPES.find(s=>s.key===ev.type)?.label;
                  const res = ev.type === 'foul' ? '' : ev.result === 'made' ? '✓' : '✕';
                  return (
                    <li key={ev.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                      <div className="text-sm">
                        <span className="text-gray-500 mr-1">[{ev.period}]</span>
                        <span className="font-medium">{player ? `#${player.number} ${player.name}` : 'Giocatore'}</span>
                        <span className="ml-2">{label} {res}</span>
                      </div>
                      <button onClick={()=>removeEvent(idx)} className="text-xs text-red-600 hover:underline">Elimina</button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
