import React, { useMemo, useState } from 'react';
import { GROUPS } from './AdminAthletes';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ScheduleManager({ teamsByGroup, schedule, setSchedule }) {
  const [group, setGroup] = useState(GROUPS[0]);
  const [date, setDate] = useState('');
  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');

  const teams = useMemo(() => teamsByGroup[group] || [], [teamsByGroup, group]);

  const addMatch = () => {
    if (!date || !homeId || !awayId || homeId === awayId) return;
    const match = { id: uid(), date, group, homeId, awayId };
    setSchedule([...schedule, match]);
    setDate('');
    setHomeId('');
    setAwayId('');
  };

  const removeMatch = (id) => setSchedule(schedule.filter((m) => m.id !== id));

  const nameById = Object.fromEntries(teams.map((t) => [t.id, t.name]));

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">Calendario Partite</h2>
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="border rounded px-2 py-1">
          {GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-4 gap-2 items-end">
        <div className="md:col-span-1">
          <label className="block text-sm text-gray-600 mb-1">Data</label>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Casa</label>
          <select value={homeId} onChange={(e) => setHomeId(e.target.value)} className="w-full border rounded px-2 py-2">
            <option value="">Seleziona squadra</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Ospiti</label>
          <select value={awayId} onChange={(e) => setAwayId(e.target.value)} className="w-full border rounded px-2 py-2">
            <option value="">Seleziona squadra</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <button onClick={addMatch} className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Aggiungi</button>
      </div>

      <ul className="divide-y">
        {schedule.filter((m) => m.group === group).map((m) => (
          <li key={m.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{nameById[m.homeId] || '—'} vs {nameById[m.awayId] || '—'}</div>
              <div className="text-xs text-gray-500">{new Date(m.date).toLocaleString()} • {m.group}</div>
            </div>
            <button onClick={() => removeMatch(m.id)} className="text-red-600 hover:underline">Rimuovi</button>
          </li>
        ))}
        {schedule.filter((m) => m.group === group).length === 0 && (
          <li className="py-4 text-sm text-gray-500">Nessuna partita per questo gruppo.</li>
        )}
      </ul>
    </div>
  );
}
