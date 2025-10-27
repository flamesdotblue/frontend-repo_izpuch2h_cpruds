import React, { useMemo, useState } from 'react';
import { GROUPS } from './AdminAthletes';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function TeamsManager({ athletesByGroup, teamsByGroup, setTeamsByGroup }) {
  const [group, setGroup] = useState(GROUPS[0]);
  const [teamName, setTeamName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const athletes = useMemo(() => athletesByGroup[group] || [], [athletesByGroup, group]);
  const teams = teamsByGroup[group] || [];

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const createTeam = () => {
    if (!teamName.trim()) return;
    const nextTeam = { id: uid(), name: teamName.trim(), athleteIds: selectedIds };
    const next = { ...teamsByGroup, [group]: [...teams, nextTeam] };
    setTeamsByGroup(next);
    setTeamName('');
    setSelectedIds([]);
  };

  const removeTeam = (id) => {
    setTeamsByGroup({ ...teamsByGroup, [group]: teams.filter((t) => t.id !== id) });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">Gestione Squadre</h2>
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="border rounded px-2 py-1">
          {GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Crea squadra</h3>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Nome squadra"
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <div className="max-h-48 overflow-auto border rounded p-2 space-y-1">
            {athletes.map((a) => (
              <label key={a.id} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)} />
                <span>{a.name}</span>
              </label>
            ))}
            {athletes.length === 0 && <div className="text-sm text-gray-500">Aggiungi atleti nel gruppo selezionato.</div>}
          </div>
          <button onClick={createTeam} className="mt-2 px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Crea squadra</button>
        </div>
        <div>
          <h3 className="font-medium mb-2">Squadre esistenti</h3>
          <ul className="divide-y">
            {teams.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">Atleti: {t.athleteIds.length}</div>
                </div>
                <button onClick={() => removeTeam(t.id)} className="text-red-600 hover:underline">Rimuovi</button>
              </li>
            ))}
            {teams.length === 0 && <li className="py-4 text-sm text-gray-500">Nessuna squadra nel gruppo.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
