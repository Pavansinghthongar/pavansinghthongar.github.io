/* Synthetic, deterministic sample data for the demo dashboard and SQL Lab.
   No real client data. A seeded PRNG keeps the numbers the same on every visit. */
(function () {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = mulberry32(20260801);
  function pick(arr, weights) {
    var r = rand() * weights.reduce(function (a, b) { return a + b; }, 0);
    for (var i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  }
  function gauss() { var u = 1 - rand(), v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  var MONTHS = [];
  for (var m = 0; m < 12; m++) {
    var d = new Date(Date.UTC(2025, 10 + m, 1));
    MONTHS.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) + " '" + String(d.getUTCFullYear()).slice(2),
      days: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
    });
  }
  var REGIONS = ['North', 'South', 'East', 'West'];
  var CHANNELS = ['Phone', 'Email', 'Chat', 'Portal'];
  var TEAMS = [
    { team_id: 1, team_name: 'Billing', manager: 'R. Patel' },
    { team_id: 2, team_name: 'Claims', manager: 'M. Garcia' },
    { team_id: 3, team_name: 'Onboarding', manager: 'S. Chen' },
    { team_id: 4, team_name: 'Tier 2 Support', manager: 'D. Okafor' },
    { team_id: 5, team_name: 'Renewals', manager: 'L. Novak' }
  ];
  var FIRST = ['Ava','Ben','Chloe','Dev','Elena','Faisal','Grace','Hiro','Isha','Jon','Kira','Leo','Maya','Nate','Omar','Priya','Quinn','Ravi','Sara','Tom','Uma','Vik','Wen','Xavi','Yara','Zane','Asha','Bilal','Cara','Diego'];
  var AGENTS = [];
  var agentsPerTeam = { 1: 7, 2: 7, 3: 6, 4: 4, 5: 6 }; // Tier 2 is understaffed (the "story")
  var aid = 101;
  TEAMS.forEach(function (t) {
    for (var i = 0; i < agentsPerTeam[t.team_id]; i++) {
      AGENTS.push({
        agent_id: aid, agent_name: FIRST[(aid - 101) % FIRST.length] + ' ' + String.fromCharCode(65 + ((aid * 7) % 26)) + '.',
        team_id: t.team_id, tenure_months: Math.round(3 + rand() * 54)
      });
      aid++;
    }
  });
  var teamWeights = [24, 22, 16, 22, 16];
  var regionBase = { North: 0, South: 0.15, East: -0.1, West: 0.55 };   // extra hours
  var channelBase = { Phone: 6, Email: 14, Chat: 3.2, Portal: 10 };      // base resolution hrs
  var channelW = [30, 28, 26, 16];

  var TICKETS = [];
  var id = 100001;
  MONTHS.forEach(function (mo, mi) {
    // volume grows; seasonal bump in Jan & Jul
    var vol = Math.round(430 + mi * 14 + (mi === 2 || mi === 8 ? 60 : 0) + gauss() * 18);
    // process improvements kick in mid-year → faster + happier
    var improve = Math.min(1, Math.max(0, (mi - 4) / 6));
    for (var k = 0; k < vol; k++) {
      var region = pick(REGIONS, [27, 24, 26, 23]);
      // chat share grows over time
      var channel = pick(CHANNELS, [channelW[0] - mi * 0.8, channelW[1] - mi * 0.4, channelW[2] + mi * 1.2, channelW[3]]);
      var team = pick(TEAMS, teamWeights);
      var teamAgents = AGENTS.filter(function (a) { return a.team_id === team.team_id; });
      var agent = teamAgents[Math.floor(rand() * teamAgents.length)];
      var tenureBoost = agent.tenure_months > 24 ? -0.12 : agent.tenure_months < 9 ? 0.18 : 0;
      var load = team.team_id === 4 ? 0.35 : 0;
      var hrs = channelBase[channel] * (1 + regionBase[region] * 0.5 + tenureBoost + load - improve * 0.22) * Math.exp(gauss() * 0.35);
      hrs = Math.max(0.3, Math.round(hrs * 10) / 10);
      var slaLimit = { Phone: 8, Email: 24, Chat: 4, Portal: 16 }[channel];
      var sla = hrs <= slaLimit ? 1 : 0;
      var csatRaw = 4.35 - (hrs / slaLimit) * 0.9 + improve * 0.25 + gauss() * 0.7 - (region === 'West' ? 0.15 : 0);
      var csat = Math.max(1, Math.min(5, Math.round(csatRaw)));
      if (rand() < 0.07) csat = null; // unanswered surveys (realistic nulls)
      var day = 1 + Math.floor(rand() * mo.days);
      TICKETS.push({
        ticket_id: id++, created_date: mo.key + '-' + String(day).padStart(2, '0'), month: mi,
        region: region, channel: channel, team_id: team.team_id, agent_id: agent.agent_id,
        resolution_hrs: hrs, csat: csat, sla_met: sla
      });
    }
  });

  window.DEMO_DATA = { MONTHS: MONTHS, REGIONS: REGIONS, CHANNELS: CHANNELS, TEAMS: TEAMS, AGENTS: AGENTS, TICKETS: TICKETS };
})();
