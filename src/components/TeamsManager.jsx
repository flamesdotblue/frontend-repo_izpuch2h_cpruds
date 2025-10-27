import React, { useMemo, useState } from 'react';

const GROUPS = ['U13', 'U14', 'U15', 'U16', 'U17'];

export default function TeamsManager({ teamsByGroup, onAddTeam, onRemoveTeam }) {
  const [group, setGroup] = useState('U13');
  const [teamName, setTeamName] = useState('');

  const teams = useMemo(() => teamsByGroup[group] || [], [teamsByGroup, group]);

  const handleAdd = (e) => {
    e.preventDefault();
    const name = teamName.trim();
    if (!name) return;
    if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) return;
    onAddTeam({ id: crypto.randomUUID(), name, group });
    setTeamName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Gestione Squadre</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select value={group} onChange={(e)=>setGroup(e.target.value)} className="w-full rounded border px-3 py-2">
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Nome Squadra</label>
            <input value={teamName} onChange={(e)=>setTeamName(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="Es. Tigers U14" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded px-4 py-2">Aggiungi</button>
          </div>
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-3">Elenco {group}</h3>
        <ul className="divide-y">
          {teams.length === 0 && (
            <li className="py-4 text-sm text-gray-500">Nessuna squadra inserita per {group}</li>
          )}
          {teams.map(t => (
            <li key={t.id} className="flex items-center justify-between py-3">
              <div className="font-medium">{t.name}</div>
              <button onClick={() => onRemoveTeam(t)} className="text-red-600 hover:underline text-sm">Rimuovi</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
