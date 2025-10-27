import React, { useMemo, useState } from 'react';
import StatsPanel from './StatsPanel';

const SHOT_TYPES = {
  layup: { label: 'Terzo tempo', points: 2 },
  two: { label: 'Tiro da 2', points: 2 },
  three: { label: 'Tiro da 3', points: 3 },
  freeThrow: { label: 'Tiro libero', points: 1 },
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function MatchTracker({
  schedule,
  teamsByGroup,
  athletesByGroup,
  matchStatsById,
  setMatchStatsById,
}) {
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [side, setSide] = useState('home'); // home | away
  const match = useMemo(() => schedule.find((m) => m.id === selectedMatchId), [schedule, selectedMatchId]);

  const teams = useMemo(() => teamsByGroup[match?.group] || [], [teamsByGroup, match]);
  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
  const athletes = useMemo(() => athletesByGroup[match?.group] || [], [athletesByGroup, match]);
  const athleteById = Object.fromEntries(athletes.map((a) => [a.id, a]));

  const statsForMatch = matchStatsById[selectedMatchId] || { events: [], roster: { home: [], away: [] } };
  const roster = statsForMatch.roster?.[side] || [];

  const team = match ? teamById[match[side + 'Id']] : null;
  const teamRoster = team?.athleteIds || [];

  const toggleRoster = (athleteId) => {
    const current = statsForMatch.roster?.[side] || [];
    const exists = current.includes(athleteId);
    let next = current;
    if (exists) {
      next = current.filter((id) => id !== athleteId);
    } else {
      if (current.length >= 12) return; // max 12 convocati
      next = [...current, athleteId];
    }
    const updated = {
      ...matchStatsById,
      [selectedMatchId]: {
        events: statsForMatch.events || [],
        roster: {
          home: side === 'home' ? next : (statsForMatch.roster?.home || []),
          away: side === 'away' ? next : (statsForMatch.roster?.away || []),
        },
      },
    };
    setMatchStatsById(updated);
  };

  const addEvent = (payload) => {
    if (!selectedMatchId) return;
    if (!payload.athleteId) return;
    const nextEvent = { id: uid(), ts: Date.now(), side, ...payload };
    const updated = {
      ...matchStatsById,
      [selectedMatchId]: {
        events: [...(statsForMatch.events || []), nextEvent],
        roster: statsForMatch.roster || { home: [], away: [] },
      },
    };
    setMatchStatsById(updated);
  };

  const removeEvent = (id) => {
    const updated = {
      ...matchStatsById,
      [selectedMatchId]: {
        events: (statsForMatch.events || []).filter((e) => e.id !== id),
        roster: statsForMatch.roster || { home: [], away: [] },
      },
    };
    setMatchStatsById(updated);
  };

  const eventsForSide = (statsForMatch.events || []).filter((e) => e.side === side);

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <h2 className="font-semibold text-lg">Match Tracker</h2>

      <div className="grid md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Partita</label>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="w-full border rounded px-2 py-2"
          >
            <option value="">Seleziona</option>
            {schedule.map((m) => (
              <option key={m.id} value={m.id}>
                {new Date(m.date).toLocaleString()} • {m.group}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Lato</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSide('home')}
              className={`px-3 py-2 rounded border ${side === 'home' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'}`}
            >Casa</button>
            <button
              onClick={() => setSide('away')}
              className={`px-3 py-2 rounded border ${side === 'away' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'}`}
            >Ospiti</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Squadra selezionata</label>
          <div className="px-3 py-2 border rounded bg-slate-50">
            {team ? team.name : '—'}
          </div>
        </div>
      </div>

      {selectedMatchId && team && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Convocati ({roster.length}/12)</h3>
                <span className="text-xs text-gray-500">Seleziona fino a 12 atleti</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {teamRoster.map((id) => (
                  <button
                    key={id}
                    onClick={() => toggleRoster(id)}
                    className={`text-left px-3 py-2 rounded border ${
                      roster.includes(id) ? 'bg-emerald-50 border-emerald-500' : 'bg-white'
                    }`}
                  >
                    <div className="font-medium text-sm">{athleteById[id]?.name || '—'}</div>
                    <div className="text-xs text-gray-500">ID: {id.slice(-4)}</div>
                  </button>
                ))}
                {teamRoster.length === 0 && (
                  <div className="text-sm text-gray-500">La squadra non ha atleti assegnati.</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Eventi rapidi</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {roster.map((athleteId) => (
                  <div key={athleteId} className="p-3 rounded border">
                    <div className="font-medium mb-2">{athleteById[athleteId]?.name}</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => addEvent({ type: 'foul', athleteId })}
                        className="px-2 py-1 rounded bg-orange-100 text-orange-700 border border-orange-300"
                      >Fall</button>

                      {Object.entries(SHOT_TYPES).map(([key, meta]) => (
                        <div key={key} className="flex items-center gap-1">
                          <button
                            onClick={() => addEvent({ type: key, made: true, athleteId })}
                            className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 border border-emerald-300"
                          >{meta.label} ✓</button>
                          <button
                            onClick={() => addEvent({ type: key, made: false, athleteId })}
                            className="px-2 py-1 rounded bg-rose-100 text-rose-700 border border-rose-300"
                          >{meta.label} ✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {roster.length === 0 && (
                  <div className="text-sm text-gray-500">Seleziona i convocati per abilitare gli eventi.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <StatsPanel
              events={eventsForSide}
              roster={roster}
              athletesById={athleteById}
            />

            <div className="bg-slate-50 rounded-xl p-3">
              <h3 className="font-semibold mb-2">Log eventi</h3>
              <ul className="space-y-1 max-h-64 overflow-auto">
                {eventsForSide.slice().reverse().map((e) => (
                  <li key={e.id} className="flex items-center justify-between bg-white border rounded p-2">
                    <div className="text-sm">
                      <span className="font-medium">{athleteById[e.athleteId]?.name}</span>{' '}
                      {e.type === 'foul' ? (
                        <span className="text-orange-700">fallo</span>
                      ) : (
                        <>
                          <span className="text-slate-600">{SHOT_TYPES[e.type]?.label || e.type}</span>{' '}
                          <span className={e.made ? 'text-emerald-700' : 'text-rose-700'}>{e.made ? '✓' : '✕'}</span>
                        </>
                      )}
                      <span className="text-xs text-gray-500 ml-2">{new Date(e.ts).toLocaleTimeString()}</span>
                    </div>
                    <button onClick={() => removeEvent(e.id)} className="text-xs text-red-600 hover:underline">Elimina</button>
                  </li>
                ))}
                {eventsForSide.length === 0 && (
                  <li className="text-sm text-gray-500">Nessun evento per questo lato.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedMatchId && !team && (
        <div className="text-sm text-red-600">Seleziona una partita valida con squadre esistenti.</div>
      )}
    </div>
  );
}
