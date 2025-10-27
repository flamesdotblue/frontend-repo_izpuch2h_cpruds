import React, { useMemo, useState } from 'react';

const GROUPS = ['U13', 'U14', 'U15', 'U16', 'U17'];

export default function ScheduleManager({ schedule, teamsByGroup, onAddMatch, onRemoveMatch }) {
  const [group, setGroup] = useState('U13');
  const [date, setDate] = useState('');
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');

  const grouped = useMemo(() => {
    const by = {};
    for (const g of GROUPS) by[g] = [];
    for (const m of schedule) {
      if (!by[m.group]) by[m.group] = [];
      by[m.group].push(m);
    }
    for (const g of GROUPS) by[g].sort((a,b)=> new Date(a.date) - new Date(b.date));
    return by;
  }, [schedule]);

  const groupTeams = useMemo(() => teamsByGroup[group] || [], [teamsByGroup, group]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!date || !home.trim() || !away.trim()) return;
    onAddMatch({ id: crypto.randomUUID(), date, home: home.trim(), away: away.trim(), group });
    setDate('');
    setHome('');
    setAway('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Calendario Match</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select value={group} onChange={(e)=>{setGroup(e.target.value); setHome(''); setAway('');}} className="w-full rounded border px-3 py-2">
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Home</label>
            {groupTeams.length > 0 ? (
              <select value={home} onChange={(e)=>setHome(e.target.value)} className="w-full rounded border px-3 py-2">
                <option value="">— Seleziona —</option>
                {groupTeams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            ) : (
              <input value={home} onChange={(e)=>setHome(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="Squadra Casa" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ospite</label>
            {groupTeams.length > 0 ? (
              <select value={away} onChange={(e)=>setAway(e.target.value)} className="w-full rounded border px-3 py-2">
                <option value="">— Seleziona —</option>
                {groupTeams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            ) : (
              <input value={away} onChange={(e)=>setAway(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="Squadra Ospite" />
            )}
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2">Aggiungi</button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GROUPS.map(g => (
          <div key={g} className="bg-white/80 backdrop-blur rounded-xl p-4 shadow">
            <h3 className="font-semibold mb-3">{g}</h3>
            <ul className="divide-y">
              {grouped[g].length === 0 && (
                <li className="py-4 text-sm text-gray-500">Nessun match programmato</li>
              )}
              {grouped[g].map(m => (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{m.home} vs {m.away}</div>
                    <div className="text-xs text-gray-500">{new Date(m.date).toLocaleString()}</div>
                  </div>
                  <button onClick={() => onRemoveMatch(m)} className="text-red-600 hover:underline text-sm">Rimuovi</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
