import React, { useState } from 'react';

const GROUPS = ['U13', 'U14', 'U15', 'U16', 'U17'];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AdminAthletes({ athletesByGroup, setAthletesByGroup }) {
  const [group, setGroup] = useState(GROUPS[0]);
  const [name, setName] = useState('');

  const athletes = athletesByGroup[group] || [];

  const addAthlete = () => {
    if (!name.trim()) return;
    const next = { id: uid(), name: name.trim() };
    setAthletesByGroup({ ...athletesByGroup, [group]: [...athletes, next] });
    setName('');
  };

  const removeAthlete = (id) => {
    setAthletesByGroup({
      ...athletesByGroup,
      [group]: athletes.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">Gestione Atleti</h2>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome atleta"
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={addAthlete} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Aggiungi</button>
      </div>

      <ul className="divide-y">
        {athletes.map((a) => (
          <li key={a.id} className="py-2 flex items-center justify-between">
            <span>{a.name}</span>
            <button
              onClick={() => removeAthlete(a.id)}
              className="text-red-600 hover:underline"
            >Rimuovi</button>
          </li>
        ))}
        {athletes.length === 0 && (
          <li className="py-4 text-sm text-gray-500">Nessun atleta per questo gruppo.</li>
        )}
      </ul>
    </div>
  );
}

export { GROUPS };
