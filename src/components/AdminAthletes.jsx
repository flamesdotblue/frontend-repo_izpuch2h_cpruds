import React, { useMemo, useState } from 'react';

const GROUPS = ['U13', 'U14', 'U15', 'U16', 'U17'];

export default function AdminAthletes({ athletesByGroup, onAddAthlete, onRemoveAthlete }) {
  const [group, setGroup] = useState('U13');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [team, setTeam] = useState('');

  const athletes = useMemo(() => athletesByGroup[group] || [], [athletesByGroup, group]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !number.trim() || !team.trim()) return;
    const jersey = parseInt(number, 10);
    if (Number.isNaN(jersey)) return;
    onAddAthlete({ id: crypto.randomUUID(), name: name.trim(), number: jersey, team: team.trim(), group });
    setName('');
    setNumber('');
    setTeam('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Gestione Atleti</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select value={group} onChange={(e)=>setGroup(e.target.value)} className="w-full rounded border px-3 py-2">
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="Giocatore" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numero</label>
            <input value={number} onChange={(e)=>setNumber(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="12" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Squadra</label>
            <input value={team} onChange={(e)=>setTeam(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="Giovanile" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">Aggiungi</button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
          <h3 className="font-semibold mb-3">Elenco {group}</h3>
          <ul className="divide-y">
            {athletes.length === 0 && (
              <li className="py-4 text-sm text-gray-500">Nessun atleta inserito per {group}</li>
            )}
            {athletes.map(a => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-semibold">{a.number}</span>
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-gray-500">{a.team}</div>
                  </div>
                </div>
                <button onClick={() => onRemoveAthlete(a)} className="text-red-600 hover:underline text-sm">Rimuovi</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <h3 className="font-semibold mb-2">Suggerimenti</h3>
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
            <li>Organizza gli atleti per categoria per facilitarne la convocazione.</li>
            <li>Usa il numero di maglia ufficiale per un tracciamento coerente.</li>
            <li>La squadra serve per distinguere gruppi o annate interne.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
