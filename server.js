const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const SHERPA_PASSWORD = process.env.SHERPA_PASSWORD || 'pantheon2024';

// In-memory state
let queue = [];
let completed = [];
let idCounter = 1;

app.use(express.static(path.join(__dirname, 'public')));

function getState() {
  return { queue, completed };
}

io.on('connection', (socket) => {
  // Send current state to new connection
  socket.emit('state', getState());

  // Guardian joins the queue
  socket.on('join', ({ bungie, discord }, cb) => {
    if (!bungie || !discord) return cb({ ok: false, msg: 'Missing fields.' });
    if (!/^.+#\d{4,}$/.test(bungie.trim())) return cb({ ok: false, msg: 'Bungie ID must include your tag, e.g. Guardian#1234' });

    const already = queue.find(
      e => e.bungie.toLowerCase() === bungie.trim().toLowerCase() ||
           e.discord.toLowerCase() === discord.trim().toLowerCase()
    );
    if (already) return cb({ ok: false, msg: "You're already in the queue!" });

    const entry = {
      id: idCounter++,
      bungie: bungie.trim(),
      discord: discord.trim(),
      status: 'waiting',
      joinedAt: Date.now()
    };
    queue.push(entry);
    io.emit('state', getState());
    cb({ ok: true });
  });

  // Sherpa: verify password
  socket.on('sherpa_auth', ({ password }, cb) => {
    cb({ ok: password === SHERPA_PASSWORD });
  });

  // Sherpa: call next
  socket.on('call_next', ({ password }, cb) => {
    if (password !== SHERPA_PASSWORD) return cb({ ok: false, msg: 'Wrong password.' });
    const running = queue.find(e => e.status === 'running');
    if (running) return cb({ ok: false, msg: 'A run is already in progress. Mark it done first.' });
    const next = queue.find(e => e.status === 'waiting');
    if (!next) return cb({ ok: false, msg: 'Queue is empty.' });
    next.status = 'running';
    io.emit('state', getState());
    cb({ ok: true });
  });

  // Sherpa: mark done
  socket.on('mark_done', ({ password, id }, cb) => {
    if (password !== SHERPA_PASSWORD) return cb({ ok: false, msg: 'Wrong password.' });
    const idx = queue.findIndex(e => e.id === id);
    if (idx === -1) return cb({ ok: false, msg: 'Entry not found.' });
    const [entry] = queue.splice(idx, 1);
    entry.completedAt = Date.now();
    entry.status = 'done';
    completed.unshift(entry);
    io.emit('state', getState());
    cb({ ok: true });
  });

  // Sherpa: remove from queue
  socket.on('remove', ({ password, id }, cb) => {
    if (password !== SHERPA_PASSWORD) return cb({ ok: false, msg: 'Wrong password.' });
    queue = queue.filter(e => e.id !== id);
    io.emit('state', getState());
    cb({ ok: true });
  });

  // Sherpa: clear queue
  socket.on('clear_queue', ({ password }, cb) => {
    if (password !== SHERPA_PASSWORD) return cb({ ok: false, msg: 'Wrong password.' });
    queue = [];
    io.emit('state', getState());
    cb({ ok: true });
  });
});

server.listen(PORT, () => {
  console.log(`Pantheon Queue running on port ${PORT}`);
  console.log(`Sherpa password: ${SHERPA_PASSWORD}`);
});
