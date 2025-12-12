// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Chess = require("chess.js").Chess; // chess.js
const Stockfish = require("stockfish");   // stockfish npm (wasm/worker)

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Create a stockfish instance factory
function createEngine() {
  const engine = Stockfish();
  return engine;
}

// helper: run Stockfish to get bestmove for a given FEN and movetime (ms)
function getBestMove(fen, movetimeMs = 500) {
  return new Promise((resolve, reject) => {
    const engine = createEngine();
    let bestMove = null;
    let ready = false;

    function send(cmd) {
      try { engine.postMessage(cmd); } catch (e) { /* some builds use engine(cmd) */ try { engine(cmd); } catch (ee) {} }
    }

    // onmessage for worker-like interface
    engine.onmessage = function (line) {
      if (!line) return;

      // some builds provide lines as objects, ensure string
      const text = typeof line === "string" ? line : (line.data || "");

      // listen for bestmove
      if (text.startsWith("bestmove")) {
        const parts = text.split(" ");
        bestMove = parts[1];
        // stop engine (some builds require final commands)
        try { send("quit"); } catch (e) {}
        return resolve(bestMove);
      }

      // optional: handle 'uciok' or 'readyok'
      // console.log("SF:", text);
    };

    // initialize and send commands
    // Some builds expect 'uci' 'isready' etc.
    try {
      send("uci");
      send("isready");
      send("ucinewgame");
      send(`position fen ${fen}`);
      // start search
      send(`go movetime ${Math.max(1, Math.floor(movetimeMs))}`);
      // if engine never returns, timeout fallback
      setTimeout(() => {
        if (!bestMove) {
          try { send("quit"); } catch (e) {}
          return reject(new Error("Stockfish timeout/no bestmove returned"));
        }
      }, movetimeMs + 2000);
    } catch (err) {
      return reject(err);
    }
  });
}

// POST /move
// body: { startFEN: string (optional, default "startpos"), moves: "e2e4 e7e5 ...", movetime: ms (optional) }
app.post("/move", async (req, res) => {
  try {
    const body = req.body || {};
    const startFEN = (body.startFEN && body.startFEN !== "startpos") ? body.startFEN : null;
    const movesStr = (body.moves || "").trim(); // space-separated moves in UCI or algebraic SAN? we'll prefer UCI like e2e4
    const movetime = Number(body.movetime) || 500; // ms for SF

    // create chess instance starting from startFEN or default
    const chess = startFEN ? new Chess(startFEN) : new Chess();

    // apply moves if provided
    if (movesStr.length > 0) {
      const moveList = movesStr.split(/\s+/);
      for (const mv of moveList) {
        // Try to play as UCI/long algebraic first (ex: e2e4). chess.js accepts SAN or { from, to, promotion }
        let played = null;
        // if mv length 4 or 5 => likely UCI (e2e4 or e7e8q)
        if (/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(mv)) {
          const from = mv.substring(0,2);
          const to = mv.substring(2,4);
          const prom = mv.length === 5 ? mv[4] : undefined;
          try {
            played = chess.move({ from: from, to: to, promotion: prom });
          } catch (e) {
            // ignore
          }
        }
        // fallback: try SAN (algebraic)
        if (!played) {
          try { played = chess.move(mv); } catch (e) { played = null; }
        }
        if (!played) {
          return res.status(400).json({ error: "Invalid move in moves list", invalidMove: mv });
        }
      }
    }

    // now current fen
    const currentFen = chess.fen();

    // If game over (checkmate/stalemate), return game-over
    if (chess.game_over()) {
      return res.json({ bestmove: null, fen: currentFen, gameOver: true, reason: chess.in_checkmate() ? "checkmate" : "draw" });
    }

    // ask stockfish for bestmove from currentFen
    const best = await getBestMove(currentFen, movetime);

    if (!best || best === "(none)") {
      return res.status(500).json({ error: "No best move returned by engine" });
    }

    // apply best move to chess to produce next fen
    // best is UCI like e7e5 or e7e8q
    let applied = null;
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(best)) {
      const from = best.substring(0,2);
      const to = best.substring(2,4);
      const prom = best.length === 5 ? best[4] : undefined;
      applied = chess.move({ from: from, to: to, promotion: prom });
    } else {
      // fallback SAN
      applied = chess.move(best);
    }

    if (!applied) {
      // If engine returned a move that couldn't be applied, return error
      return res.status(500).json({ error: "Engine returned move that cannot be applied", engineMove: best });
    }

    const newFen = chess.fen();
    return res.json({ bestmove: best, fen: newFen });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error", details: String(err) });
  }
});

app.get("/", (req, res) => {
  res.json({ ok: true, info: "Chess bot API running" });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
