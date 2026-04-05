const { createCanvas } = require('@napi-rs/canvas');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  const W = 1170, H = 2532;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((now - start) / 86400000) + 1;
  const totalDays = 365;
  const daysLeft = totalDays - dayOfYear;
  const yearPct = Math.round((dayOfYear / totalDays) * 100);
  const streak = parseInt(req.query.streak || '12');
  const goal = req.query.goal || 'Grow LFS to 500 clients';
  const waterDone = parseInt(req.query.water || '4');
  const waterGoal = 8;
  const hour = now.getHours() + now.getMinutes() / 60;

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // ── Background ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#080b14');
  bgGrad.addColorStop(0.4, '#0c0f1e');
  bgGrad.addColorStop(1, '#080b14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Purple glow top
  const glow = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, 500);
  glow.addColorStop(0, 'rgba(124,92,252,0.25)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 600);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  const starPositions = [[200,120],[900,80],[500,200],[100,400],[1050,300],[350,160],[750,90],[80,250],[1000,450],[600,130]];
  starPositions.forEach(([x,y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI*2);
    ctx.fill();
  });

  const pad = 50;
  let y = 450; // Space for iPhone clock

  // ── Helper: rounded rect ──
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // Brand text
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '8px';
  ctx.fillText('A P E X  ·  L I F E', W/2, y - 30);
  ctx.letterSpacing = '0px';

  // ── BADGES ROW ──
  y += 20;
  const badgeH = 72;
  const badgeW = (W - pad*2 - 30) / 3;

  // Days left badge
  roundRect(pad, y, badgeW, badgeH, 36);
  ctx.fillStyle = 'rgba(124,92,252,0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(124,92,252,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#7c5cfc';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${daysLeft} days left`, pad + badgeW/2, y + 44);

  // Year % badge
  const b2x = pad + badgeW + 15;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '26px sans-serif';
  ctx.fillText(`${year} · ${yearPct}% done`, b2x + badgeW/2, y + 44);

  // Streak badge
  const b3x = pad + badgeW*2 + 30;
  roundRect(b3x, y, badgeW, badgeH, 36);
  const strGrad = ctx.createLinearGradient(b3x, y, b3x + badgeW, y);
  strGrad.addColorStop(0, '#ff6b35');
  strGrad.addColorStop(1, '#ff4500');
  ctx.fillStyle = strGrad;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(`🔥 ${streak} streak`, b3x + badgeW/2, y + 44);

  y += badgeH + 30;

  // ── DOT GRID ──
  const gridPad = 24;
  const cols = 53;
  const rows = Math.ceil(totalDays / cols);
  const dotAreaW = W - pad*2 - gridPad*2;
  const dotSize = Math.floor(dotAreaW / cols) - 3;
  const gridH = rows * (dotSize + 4) + gridPad*2;

  roundRect(pad, y, W - pad*2, gridH, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  for (let i = 0; i < totalDays; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const dx = pad + gridPad + col * (dotSize + 4);
    const dy = y + gridPad + row * (dotSize + 4);
    const dayNum = i + 1;

    ctx.beginPath();
    ctx.arc(dx + dotSize/2, dy + dotSize/2, dotSize/2, 0, Math.PI*2);
    if (dayNum < dayOfYear) {
      ctx.fillStyle = '#7c5cfc';
    } else if (dayNum === dayOfYear) {
      ctx.fillStyle = '#ff6b35';
      ctx.shadowColor = 'rgba(255,107,53,0.8)';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  y += gridH + 26;

  // ── YEARLY GOAL ──
  const goalH = 90;
  roundRect(pad, y, W - pad*2, goalH, 22);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Purple dot
  ctx.beginPath();
  ctx.arc(pad + 30, y + goalH/2, 8, 0, Math.PI*2);
  ctx.fillStyle = '#7c5cfc';
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Yearly Goal', pad + 52, y + goalH/2 + 8);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(goal, W - pad - 20, y + goalH/2 + 8);

  y += goalH + 18;

  // ── TASKS ──
  const tasks = [
    { emoji: '💪', title: 'Morning Workout', sub: '5:00 AM · 45 min', startH: 5, endH: 6 },
    { emoji: '📖', title: 'Deep Work / LFS', sub: '9:00 AM · 2 hrs', startH: 9, endH: 11 },
    { emoji: '📞', title: 'Client Calls', sub: '12:00 PM · 1 hr', startH: 12, endH: 13 },
    { emoji: '🎯', title: 'Evening Review', sub: '7:00 PM · 30 min', startH: 19, endH: 20 },
  ];

  const taskH = 110;
  tasks.forEach(t => {
    let status = 'NEXT', badgeColor = 'rgba(255,255,255,0.1)', textColor = 'rgba(255,255,255,0.6)';
    if (hour >= t.endH) { status = 'DONE'; badgeColor = 'rgba(0,214,143,0.15)'; textColor = '#00d68f'; }
    else if (hour >= t.startH) { status = 'NOW'; badgeColor = '#7c5cfc'; textColor = '#ffffff'; }

    roundRect(pad, y, W - pad*2, taskH, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Emoji circle
    roundRect(pad + 16, y + 16, 78, 78, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.font = '38px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.emoji, pad + 55, y + 66);

    // Title + sub
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(t.title, pad + 116, y + 46);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '24px sans-serif';
    ctx.fillText(t.sub, pad + 116, y + 78);

    // Badge
    const bw = 110, bh = 46;
    const bx = W - pad - bw - 10;
    const by = y + (taskH - bh) / 2;
    roundRect(bx, by, bw, bh, 23);
    ctx.fillStyle = badgeColor;
    ctx.fill();
    if (status !== 'NOW') {
      ctx.strokeStyle = status === 'DONE' ? 'rgba(0,214,143,0.3)' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = textColor;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(status, bx + bw/2, by + 31);

    y += taskH + 16;
  });

  // ── WATER TRACKER ──
  const waterCardH = 140;
  roundRect(pad, y, W - pad*2, waterCardH, 22);
  const waterGrad = ctx.createLinearGradient(pad, y, W - pad, y + waterCardH);
  waterGrad.addColorStop(0, 'rgba(77,166,255,0.1)');
  waterGrad.addColorStop(1, 'rgba(124,92,252,0.08)');
  ctx.fillStyle = waterGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(77,166,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#4da6ff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('💧 Hydration', pad + 24, y + 44);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${waterDone} of ${waterGoal} glasses`, W - pad - 24, y + 44);

  // Drops
  const dropSpacing = (W - pad*2 - 48) / waterGoal;
  for (let i = 0; i < waterGoal; i++) {
    const dx = pad + 24 + i * dropSpacing;
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'left';
    ctx.globalAlpha = i < waterDone ? 1.0 : 0.2;
    ctx.fillText('💧', dx, y + 105);
  }
  ctx.globalAlpha = 1;

  // Water bar
  const barY = y + waterCardH - 18;
  roundRect(pad + 24, barY - 8, W - pad*2 - 48, 10, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  const fillW = ((W - pad*2 - 48) * waterDone) / waterGoal;
  roundRect(pad + 24, barY - 8, fillW, 10, 5);
  const barGrad = ctx.createLinearGradient(pad + 24, 0, pad + 24 + fillW, 0);
  barGrad.addColorStop(0, '#4da6ff');
  barGrad.addColorStop(1, '#7c5cfc');
  ctx.fillStyle = barGrad;
  ctx.fill();

  y += waterCardH + 24;

  // ── QUOTE ──
  const quotes = [
    "Every day is a new deposit in your future bank.",
    "You don't rise to goals — you fall to your systems.",
    "Discipline is freedom in disguise.",
    "Small actions, compounded daily, build empires.",
  ];
  const quote = quotes[dayOfYear % quotes.length];
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = 'italic 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`"${quote}"`, W/2, y + 20);

  const buffer = canvas.toBuffer('image/png');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline; filename="nexus-wallpaper.png"');
  res.send(buffer);
};
