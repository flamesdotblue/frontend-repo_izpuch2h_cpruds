import React, { useMemo, useState } from 'react';
import AdminAthletes, { GROUPS } from './components/AdminAthletes';
import TeamsManager from './components/TeamsManager';
import ScheduleManager from './components/ScheduleManager';
import MatchTracker from './components/MatchTracker';

export default function App() {
  const [athletesByGroup, setAthletesByGroup] = useState(() => Object.fromEntries(GROUPS.map((g) => [g, []])));
  const [teamsByGroup, setTeamsByGroup] = useState(() => Object.fromEntries(GROUPS.map((g) => [g, []])));
  const [schedule, setSchedule] = useState([]);
  const [matchStatsById, setMatchStatsById] = useState({});

  const headerStats = useMemo(() => {
    const teamsCount = Object.values(teamsByGroup).reduce((acc, arr) => acc + arr.length, 0);
    const athletesCount = Object.values(athletesByGroup).reduce((acc, arr) => acc + arr.length, 0);
    return { teamsCount, athletesCount, matchesCount: schedule.length };
  }, [teamsByGroup, athletesByGroup, schedule]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Basket Manager</h1>
          <div className="text-sm text-slate-600 flex gap-4">
            <span>Atleti: <b>{headerStats.athletesCount}</b></span>
            <span>Squadre: <b>{headerStats.teamsCount}</b></span>
            <span>Partite: <b>{headerStats.matchesCount}</b></span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section className="grid lg:grid-cols-2 gap-6">
          <AdminAthletes
            athletesByGroup={athletesByGroup}
            setAthletesByGroup={setAthletesByGroup}
          />
          <TeamsManager
            athletesByGroup={athletesByGroup}
            teamsByGroup={teamsByGroup}
            setTeamsByGroup={setTeamsByGroup}
          />
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <ScheduleManager
            teamsByGroup={teamsByGroup}
            schedule={schedule}
            setSchedule={setSchedule}
          />
          <MatchTracker
            schedule={schedule}
            teamsByGroup={teamsByGroup}
            athletesByGroup={athletesByGroup}
            matchStatsById={matchStatsById}
            setMatchStatsById={setMatchStatsById}
          />
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-slate-500">
        Costruito per tracciare convocazioni e statistiche di gara (layup, 2pt, 3pt, tiri liberi, falli).
      </footer>
    </div>
  );
}
