import React, { useMemo, useState } from 'react';
import { Home, Calendar, Users, BarChart3, Settings } from 'lucide-react';
import AdminAthletes from './components/AdminAthletes.jsx';
import ScheduleManager from './components/ScheduleManager.jsx';
import MatchTracker from './components/MatchTracker.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import TeamsManager from './components/TeamsManager.jsx';

const GROUPS = ['U13', 'U14', 'U15', 'U16', 'U17'];

export default function App() {
  // Athletes: { [group]: Athlete[] }
  const [athletesByGroup, setAthletesByGroup] = useState(() => Object.fromEntries(GROUPS.map(g => [g, []])));
  // Teams: { [group]: Team[] }
  const [teamsByGroup, setTeamsByGroup] = useState(() => Object.fromEntries(GROUPS.map(g => [g, []])));
  // Matches: Array
  const [schedule, setSchedule] = useState([]);
  // Match stats by matchId
  const [matchStatsById, setMatchStatsById] = useState({});
  // UI tab
  const [tab, setTab] = useState('match');

  const onAddAthlete = (ath) => {
    setAthletesByGroup(prev => {
      const next = { ...prev };
      next[ath.group] = [...(next[ath.group] || []), ath];
      return next;
    });
  };

  const onRemoveAthlete = (ath) => {
    setAthletesByGroup(prev => {
      const next = { ...prev };
      next[ath.group] = (next[ath.group] || []).filter(a => a.id !== ath.id);
      return next;
    });
    // Also scrub from stats to avoid orphans
    setMatchStatsById(prev => {
      const clone = structuredClone(prev);
      for (const mid of Object.keys(clone)) {
        const ms = clone[mid];
        if (!ms) continue;
        ms.events = ms.events?.filter(ev => ev.playerId !== ath.id) || [];
        const rebuilt = { events: ms.events, perPlayer: {} };
        for (const ev of ms.events) {
          if (ev.type === 'foul') {
            if (!rebuilt.perPlayer[ev.playerId]) rebuilt.perPlayer[ev.playerId] = { attempts: 0, made: 0, points: 0, fouls: 0, breakdown: { layup:{a:0,m:0}, two:{a:0,m:0}, three:{a:0,m:0} } };
            rebuilt.perPlayer[ev.playerId].fouls = Math.min(5, rebuilt.perPlayer[ev.playerId].fouls + 1);
          } else {
            if (!rebuilt.perPlayer[ev.playerId]) rebuilt.perPlayer[ev.playerId] = { attempts: 0, made: 0, points: 0, fouls: 0, breakdown: { layup:{a:0,m:0}, two:{a:0,m:0}, three:{a:0,m:0} } };
            rebuilt.perPlayer[ev.playerId].attempts += 1;
            rebuilt.perPlayer[ev.playerId].breakdown[ev.type].a += 1;
            if (ev.result === 'made') {
              rebuilt.perPlayer[ev.playerId].made += 1;
              rebuilt.perPlayer[ev.playerId].breakdown[ev.type].m += 1;
              rebuilt.perPlayer[ev.playerId].points += ev.type === 'three' ? 3 : 2;
            }
          }
        }
        clone[mid] = rebuilt;
      }
      return clone;
    });
  };

  const onAddTeam = (team) => {
    setTeamsByGroup(prev => {
      const next = { ...prev };
      next[team.group] = [...(next[team.group] || []), team];
      return next;
    });
  };

  const onRemoveTeam = (team) => {
    setTeamsByGroup(prev => {
      const next = { ...prev };
      next[team.group] = (next[team.group] || []).filter(t => t.id !== team.id);
      return next;
    });
    // If athletes were assigned to this team by name, we keep the string; no change needed.
  };

  const onAddMatch = (match) => {
    setSchedule(prev => [...prev, match]);
  };

  const onRemoveMatch = (match) => {
    setSchedule(prev => prev.filter(m => m.id !== match.id));
    setMatchStatsById(prev => {
      const next = { ...prev };
      delete next[match.id];
      return next;
    });
  };

  const onUpdateMatchStats = (matchId, nextStats) => {
    setMatchStatsById(prev => ({ ...prev, [matchId]: nextStats }));
  };

  const tabs = useMemo(() => ([
    { key: 'match', label: 'Match', icon: Home },
    { key: 'athletes', label: 'Atleti', icon: Users },
    { key: 'teams', label: 'Squadre', icon: Settings },
    { key: 'schedule', label: 'Calendario', icon: Calendar },
    { key: 'stats', label: 'Statistiche', icon: BarChart3 },
  ]), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">BB</div>
            <div>
              <h1 className="font-semibold">Basket Board</h1>
              <p className="text-xs text-gray-500">Tracciamento punti, tiri e falli</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={()=>setTab(t.key)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {tab === 'athletes' && (
          <AdminAthletes
            athletesByGroup={athletesByGroup}
            teamsByGroup={teamsByGroup}
            onAddAthlete={onAddAthlete}
            onRemoveAthlete={onRemoveAthlete}
          />
        )}

        {tab === 'teams' && (
          <TeamsManager
            teamsByGroup={teamsByGroup}
            onAddTeam={onAddTeam}
            onRemoveTeam={onRemoveTeam}
          />
        )}

        {tab === 'schedule' && (
          <ScheduleManager
            schedule={schedule}
            teamsByGroup={teamsByGroup}
            onAddMatch={onAddMatch}
            onRemoveMatch={onRemoveMatch}
          />
        )}

        {tab === 'match' && (
          <MatchTracker
            schedule={schedule}
            athletesByGroup={athletesByGroup}
            matchStatsById={matchStatsById}
            onUpdateMatchStats={onUpdateMatchStats}
          />
        )}

        {tab === 'stats' && (
          <StatsPanel
            schedule={schedule}
            athletesByGroup={athletesByGroup}
            matchStatsById={matchStatsById}
          />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-gray-500">
        Prototipo locale. Per integrazione con database e autenticazione, si potrà collegare Firebase o un backend personalizzato.
      </footer>
    </div>
  );
}
