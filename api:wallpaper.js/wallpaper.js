const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store');

  // iPhone 14 Pro dimensions
  const W = 1170;
  const H = 2532;

  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((now - start) / 86400000) + 1;
  const totalDays = 365;
  const daysLeft = totalDays - dayOfYear;
  const yearPct = Math.round((dayOfYear / totalDays) * 100);
  const hour = now.getHours();
  const minute = now.getMinutes().toString().padStart(2, '0');
  const streak = parseInt(req.query.streak || '12');
  const goal = req.query.goal || 'Grow LFS to 500 clients';
  const waterDone = parseInt(req.query.water || '4');
  const waterGoal = 8;

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

  const tasks = [
    { emoji: '💪', bg: '#3d2a00', title: 'Morning Workout', sub: '5:00 AM · 45 min', startH: 5, endH: 6 },
    { emoji: '📖', bg: '#1a1a3e', title: 'Deep Work / LFS', sub: '9:00 AM · 2 hrs', startH: 9, endH: 11 },
    { emoji: '📞', bg: '#0a2a1a', title: 'Client Calls', sub: '12:00 PM · 1 hr', startH: 12, endH: 13 },
    { emoji: '🎯', bg: '#2a0a2a', title: 'Evening Review', sub: '7:00 PM · 30 min', startH: 19, endH: 20 },
  ];

  const quotes = [
    "Every day is a new deposit in your future bank.",
    "You don't rise to goals — you fall to your systems.",
    "Small actions, compounded daily, build empires.",
    "Discipline is freedom in disguise.",
  ];
  const quote = quotes[dayOfYear % quotes.length];

  // Build dots HTML
  let dotsHtml = '';
  for (let i = 1; i <= totalDays; i++) {
    if (i < dayOfYear) dotsHtml += `<div class="dot done"></div>`;
    else if (i === dayOfYear) dotsHtml += `<div class="dot today"></div>`;
    else dotsHtml += `<div class="dot"></div>`;
  }

  // Build tasks HTML
  let tasksHtml = '';
  const h = hour + now.getMinutes() / 60;
  tasks.forEach(t => {
    let status = 'NEXT', cls = 'badge-next';
    if (h >= t.endH) { status = 'DONE'; cls = 'badge-done'; }
    else if (h >= t.startH) { status = 'NOW'; cls = 'badge-now'; }
    tasksHtml += `
      <div class="task-card">
        <div class="task-icon" style="background:${t.bg}">${t.emoji}</div>
        <div class="task-info">
          <div class="task-title">${t.title}</div>
          <div class="task-sub">${t.sub}</div>
        </div>
        <div class="task-badge ${cls}">${status}</div>
      </div>`;
  });

  // Water drops
  let dropsHtml = '';
  for (let i = 1; i <= waterGoal; i++) {
    dropsHtml += `<span class="drop ${i <= waterDone ? 'filled' : 'empty'}">💧</span>`;
  }
  const waterPct = (waterDone / waterGoal) * 100;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{
  width:${W}px;height:${H}px;
  background:#080b14;
  color:#fff;
  font-family:'Outfit',sans-serif;
  overflow:hidden;
  position:relative;
}
body::before{
  content:'';position:absolute;inset:0;
  background-image:
    radial-gradient(1px 1px at 20% 15%,rgba(255,255,255,.6) 0%,transparent 100%),
    radial-gradient(1px 1px at 80% 8%,rgba(255,255,255,.5) 0%,transparent 100%),
    radial-gradient(1px 1px at 50% 40%,rgba(255,255,255,.4) 0%,transparent 100%),
    radial-gradient(1px 1px at 10% 60%,rgba(255,255,255,.5) 0%,transparent 100%),
    radial-gradient(1px 1px at 90% 70%,rgba(255,255,255,.3) 0%,transparent 100%),
    radial-gradient(1px 1px at 35% 85%,rgba(255,255,255,.4) 0%,transparent 100%),
    radial-gradient(1.5px 1.5px at 65% 25%,rgba(255,255,255,.3) 0%,transparent 100%),
    radial-gradient(1px 1px at 75% 55%,rgba(255,255,255,.5) 0%,transparent 100%),
    radial-gradient(2px 2px at 15% 30%,rgba(255,255,255,.2) 0%,transparent 100%),
    radial-gradient(1px 1px at 55% 75%,rgba(255,255,255,.4) 0%,transparent 100%),
    radial-gradient(1px 1px at 88% 35%,rgba(255,255,255,.3) 0%,transparent 100%),
    radial-gradient(1px 1px at 5% 90%,rgba(255,255,255,.4) 0%,transparent 100%);
  pointer-events:none;z-index:0;
}
body::after{
  content:'';position:absolute;
  top:-150px;left:50%;transform:translateX(-50%);
  width:600px;height:600px;
  background:radial-gradient(circle,rgba(124,92,252,.18) 0%,transparent 70%);
  pointer-events:none;z-index:0;
}
.wrap{position:relative;z-index:1;padding:0 44px 40px;}

/* Clock space */
.clock-space{height:420px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:20px;}
.brand{font-size:24px;letter-spacing:12px;color:rgba(255,255,255,.3);text-transform:uppercase;font-weight:300;margin-bottom:10px;}

/* Badges */
.badges{display:flex;align-items:center;justify-content:space-between;margin:30px 0 36px;gap:16px;}
.badge{display:flex;align-items:center;gap:10px;padding:16px 24px;border-radius:100px;font-size:26px;font-weight:700;letter-spacing:.3px;}
.badge-days{background:rgba(124,92,252,.15);border:2px solid rgba(124,92,252,.35);color:#7c5cfc;flex:1;justify-content:center;}
.badge-year{color:rgba(255,255,255,.45);font-size:24px;font-weight:400;flex:1;justify-content:center;}
.badge-streak{background:#ff6b35;color:#fff;flex:1;justify-content:center;box-shadow:0 0 40px rgba(255,107,53,.5);}

/* Dot Grid */
.dot-grid{
  display:grid;
  grid-template-columns:repeat(53,1fr);
  gap:6px;
  margin:0 0 36px;
  padding:28px;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  border-radius:28px;
}
.dot{aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.07);}
.dot.done{background:#7c5cfc;}
.dot.today{background:#ff6b35;box-shadow:0 0 10px rgba(255,107,53,.9);}

/* Goal */
.goal-card{display:flex;align-items:center;gap:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:26px 32px;margin-bottom:20px;}
.goal-dot{width:16px;height:16px;border-radius:50%;background:#7c5cfc;flex-shrink:0;box-shadow:0 0 12px #7c5cfc;}
.goal-label{font-size:24px;color:rgba(255,255,255,.45);font-weight:400;flex-shrink:0;}
.goal-text{font-size:26px;font-weight:800;color:#fff;flex:1;}

/* Tasks */
.task-card{display:flex;align-items:center;gap:24px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:28px;padding:26px 30px;margin-bottom:18px;}
.task-icon{width:80px;height:80px;border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:38px;flex-shrink:0;}
.task-title{font-size:28px;font-weight:700;color:#fff;margin-bottom:4px;}
.task-sub{font-size:22px;color:rgba(255,255,255,.45);}
.task-info{flex:1;}
.task-badge{font-size:22px;font-weight:700;padding:10px 24px;border-radius:100px;letter-spacing:.5px;flex-shrink:0;}
.badge-now{background:#7c5cfc;color:#fff;box-shadow:0 0 20px rgba(124,92,252,.6);}
.badge-next{background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.15);}
.badge-done{background:rgba(0,214,143,.12);color:#00d68f;border:1px solid rgba(0,214,143,.25);}

/* Water */
.water-card{background:linear-gradient(135deg,rgba(77,166,255,.1),rgba(124,92,252,.08));border:1px solid rgba(77,166,255,.2);border-radius:28px;padding:26px 30px;margin-bottom:20px;}
.water-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.water-title{font-size:26px;font-weight:700;color:#4da6ff;}
.water-count{font-size:22px;color:rgba(255,255,255,.5);}
.water-drops{display:flex;gap:8px;}
.drop{font-size:34px;transition:all .3s;}
.drop.empty{opacity:.18;filter:grayscale(1);}
.drop.filled{filter:drop-shadow(0 0 6px rgba(77,166,255,.7));}
.water-bar{height:6px;background:rgba(255,255,255,.08);border-radius:10px;margin-top:16px;overflow:hidden;}
.water-fill{height:100%;background:linear-gradient(90deg,#4da6ff,#7c5cfc);border-radius:10px;}

/* Quote */
.quote{text-align:center;font-size:22px;color:rgba(255,255,255,.3);font-style:italic;line-height:1.7;padding:20px 10px 0;font-weight:300;}
</style>
</head>
<body>
<div class="wrap">
  <div class="clock-space">
    <div class="brand">A P E X &nbsp;·&nbsp; L I F E</div>
  </div>

  <div class="badges">
    <div class="badge badge-days">${daysLeft} days left</div>
    <div class="badge badge-year">${year} · ${yearPct}% done</div>
    <div class="badge badge-streak">🔥 ${streak} streak</div>
  </div>

  <div class="dot-grid">${dotsHtml}</div>

  <div class="goal-card">
    <div class="goal-dot"></div>
    <span class="goal-label">Yearly Goal</span>
    <span class="goal-text">${goal}</span>
  </div>

  ${tasksHtml}

  <div class="water-card">
    <div class="water-top">
      <span class="water-title">💧 Hydration</span>
      <span class="water-count">${waterDone} of ${waterGoal} glasses</span>
    </div>
    <div class="water-drops">${dropsHtml}</div>
    <div class="water-bar"><div class="water-fill" style="width:${waterPct}%"></div></div>
  </div>

  <div class="quote">"${quote}"</div>
</div>
</body>
</html>`;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 500));

    const screenshot = await page.screenshot({ type: 'png', fullPage: false });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="nexus-wallpaper.png"');
    res.send(screenshot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
};
