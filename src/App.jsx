import React, { useState, useRef } from "react";

export default function MathBubblePractice() {
  const [customTime, setCustomTime] = useState(15); // user-chosen time per level
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [order, setOrder] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(customTime);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  const timerRef = useRef(null);

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function cryptoRandomId() {
    return Math.random().toString(36).slice(2, 9);
  }

  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function generateLevelExpressions(level) {
    const ops = shuffleArray(["+", "-", "*", "/"]);
    const generated = [];

    ops.forEach((op) => {
      let a, b, expr, value;
      switch (op) {
        case "+":
          a = randInt(1, 20 * level);
          b = randInt(1, 20 * level);
          expr = `${a} + ${b}`;
          value = a + b;
          break;
        case "-":
          a = randInt(10, 30 * level);
          b = randInt(1, a);
          expr = `${a} - ${b}`;
          value = a - b;
          break;
        case "*":
          a = randInt(1, 10 * level);
          b = randInt(1, 10 * level);
          expr = `${a} * ${b}`;
          value = a * b;
          break;
        case "/":
          b = randInt(1, 9);
          const quotient = randInt(1, 9 * level);
          a = b * quotient;
          expr = `${a} / ${b}`;
          value = quotient;
          break;
        default:
          expr = "";
          value = 0;
      }
      generated.push({ id: cryptoRandomId(), expr, value, clicked: false });
    });

    return generated;
  }

  function startNewRound() {
    const generated = generateLevelExpressions(round);
    const sorted = [...generated].sort((a, b) => a.value - b.value);
    setBubbles(generated);
    setOrder(sorted.map((x) => x.id));
    setNextIndex(0);
    setTimeLeft(customTime);
    setRunning(true);
    setMessage("");

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setRunning(false);
          setMessage("Time's up!");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handleClick(id) {
    if (!running) return;
    const expectedId = order[nextIndex];
    if (id === expectedId) {
      setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, clicked: true } : b)));
      setNextIndex((idx) => idx + 1);
      setScore((s) => s + 10);
      if (nextIndex + 1 >= order.length) {
        clearInterval(timerRef.current);
        setRunning(false);
        setMessage("Level Cleared!");
        setRound((r) => r + 1);
      }
    } else {
      setScore((s) => Math.max(0, s - 5));
      setMessage("Wrong bubble!");
      setTimeout(() => setMessage(""), 800);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Math Bubble Practice</h1>

      <div className="flex items-center gap-2 mb-4">
        <label htmlFor="timeSelect">Choose Time: </label>
        <select
          id="timeSelect"
          value={customTime}
          onChange={(e) => setCustomTime(Number(e.target.value))}
          className="bg-gray-800 text-white px-2 py-1 rounded"
          disabled={running}
        >
          <option value={15}>15s</option>
          <option value={30}>30s</option>
          <option value={45}>45s</option>
          <option value={60}>60s</option>
        </select>
      </div>

      <div className="mb-4">Level: {round} | Score: {score} | Time Left: {timeLeft}s</div>
      <div className="relative w-full h-[500px] flex flex-col justify-evenly items-center">
        {bubbles.map((b, index) => (
          <div
            key={b.id}
            style={{ transform: `translateX(${index % 2 === 0 ? "-80px" : "80px"})` }}
            className="my-3 animate-bounce-slow"
          >
            <button
              onClick={() => handleClick(b.id)}
              disabled={!running || b.clicked}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-lg font-semibold shadow-lg transition-all transform hover:scale-105 ${
                b.clicked
                  ? "bg-gray-600 text-gray-300"
                  : "bg-gradient-to-r from-pink-500 to-indigo-500"
              }`}
            >
              {b.expr}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {!running ? (
          <button
            onClick={startNewRound}
            className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded"
          >
            Start
          </button>
        ) : (
          <button
            onClick={() => {
              clearInterval(timerRef.current);
              setRunning(false);
              setMessage("Paused");
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
          >
            Pause
          </button>
        )}

        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {message && <div className="mt-4 text-yellow-400 text-lg">{message}</div>}
    </div>
  );
}