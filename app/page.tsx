"use client";

import { useEffect, useState } from "react";

// ===== CONFIG =====
const GRID_SIZE = 11;
const CELL_SIZE = 28;
const START = { x: 0, y: 10 };
const GOAL = { x: 10, y: 0 };

// 🔥 평균 플레이 1분 목표 / 직선 이동 완전 봉쇄 미로
const MAZE = [
  // 1 = wall, 0 = path
  // 정답 루트는 좌→상→우→상으로 크게 우회 (직선 불가)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // y=0 (GOAL)
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], // y=1
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0], // y=2
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=3
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1], // y=4
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=5
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // y=6
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // y=7
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1], // y=8
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=9
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=10 (START)
];

// 👀 직관적 선택지에만 배치된 함정 (정답 루트 제외)
const TRAPS = [
  // ⚠️ 모두 '갈림길의 오답 쪽'에만 위치 (정답 루트 미포함)
  { x: 5, y: 9 }, // 하단: 오른쪽 지름길 착각
  { x: 7, y: 3 }, // 하단: 오른쪽 지름길 착각
  { x: 6, y: 4 }, // 상단: 성 보이는 방향 유혹
  { x: 3, y: 1 }, // 상단: 마지막 지름길 착각
];

export default function Page() {
  const [stage, setStage] = useState("intro");
  const [text, setText] = useState("");

  const narration =
    "태초의 뱀파이어를 방문하게 된 당신.\n" +
    "하지만 저택은 생각보다 외진 곳에 있는데…\n" +
    "과연 시간 내에 길을 찾아갈 수 있을까?";

  const [pos, setPos] = useState(START);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [trapCount, setTrapCount] = useState(0);
  const [revealedTraps, setRevealedTraps] = useState([]);

  // 타이핑 효과
  useEffect(() => {
    if (stage !== "intro") return;
    let i = 0;
    const timer = setInterval(() => {
      setText(narration.slice(0, i + 1));
      i += 1;
      if (i >= narration.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [stage]);

  // 타이머
  useEffect(() => {
    if (!startTime || stage !== "maze") return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [startTime, stage]);

  // 키보드 이동
  useEffect(() => {
    if (stage !== "maze") return;
    const onKey = (e) => {
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const move = (dx, dy) => {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) return;
    if (MAZE[ny][nx] === 1) return;

    const trap = TRAPS.find((t) => t.x === nx && t.y === ny);

    if (trap) {
      const key = `${nx},${ny}`;

      // 1️⃣ 함정 위치로 일단 이동 → 아이콘 표시
      setPos({ x: nx, y: ny });

      if (!revealedTraps.includes(key)) {
        setTrapCount((c) => c + 1);
        setRevealedTraps((r) => [...r, key]);
      }

      // 2️⃣ 잠깐 보여준 뒤 시작점으로 복귀 + 함정 다시 숨김
      setTimeout(() => {
        setPos(START);
        setRevealedTraps([]);
      }, 400); // ← 0.4초 (체감상 딱 좋음)

      return;
    }

    // ✅ 안전한 길
    setPos({ x: nx, y: ny });

    if (nx === GOAL.x && ny === GOAL.y) {
      setStage("result");
    }
  };

  // ===== INTRO =====
  if (stage === "intro") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#7a1f2b",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <p
          style={{
            maxWidth: 360,
            fontSize: 18,
            lineHeight: 1.6,
            whiteSpace: "pre-line",
          }}
        >
          {text}
        </p>
        {text.length === narration.length && (
          <button
            onClick={() => {
              setStage("maze");
              setStartTime(Date.now());
            }}
            style={{
              marginTop: 24,
              padding: "12px 24px",
              background: "#7a1f2b",
              color: "#000",
              borderRadius: 12,
            }}
          >
            저택으로 가기
          </button>
        )}
      </div>
    );
  }

  // ===== MAZE =====
  if (stage === "maze") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gap: 2,
          }}
        >
          {MAZE.flatMap((row, y) =>
            row.map((cell, x) => {
              const isPlayer = pos.x === x && pos.y === y;
              const isGoal = GOAL.x === x && GOAL.y === y;
              const trapKey = `${x},${y}`;
              const revealed = revealedTraps.includes(trapKey);
              return (
                <div
                  key={`${x}-${y}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: cell === 1 ? "#2a0006" : "#111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {isPlayer && "👧"}
                  {isGoal && "🏰"}
                  {revealed && "🧛‍♀️"}
                </div>
              );
            })
          )}
        </div>

        <p style={{ marginTop: 12, fontSize: 12, color: "#aaa" }}>
          버튼 또는 키보드로 이동
        </p>
        <div
          style={{
            marginTop: 8,
            display: "grid",
            gridTemplateColumns: "repeat(3, 48px)",
            gap: 6,
          }}
        >
          <div />
          <button
            onClick={() => move(0, -1)}
            style={{ background: "#7a1f2b", borderRadius: 6 }}
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => move(-1, 0)}
            style={{ background: "#7a1f2b", borderRadius: 6 }}
          >
            ◀
          </button>
          <div />
          <button
            onClick={() => move(1, 0)}
            style={{ background: "#7a1f2b", borderRadius: 6 }}
          >
            ▶
          </button>
          <div />
          <button
            onClick={() => move(0, 1)}
            style={{ background: "#7a1f2b", borderRadius: 6 }}
          >
            ▼
          </button>
          <div />
        </div>
      </div>
    );
  }

  // ===== RESULT =====
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>저택에 도착하셨습니다</h1>
      <p>소요 시간: {elapsed}초</p>
      <p>함정 밟은 횟수: {trapCount}</p>
      <p style={{ marginTop: 16, fontSize: 14, color: "#ccc", maxWidth: 360 }}>
        무사히 뱀파이어의 저택을 방문하고 나서 <br /> 벌어지는 일이 궁금하다면?
        <br />
        연극{" "}
        <strong>
          [뱀파이어를 이해하는 특별한 방법] <br />{" "}
        </strong>{" "}
        많은 관심 부탁드립니다.
      </p>
      <a
        href="https://tickets.interpark.com/goods/26000875"
        target="_blank"
        style={{
          marginTop: 16,
          padding: "12px 24px",
          background: "#7a1f2b",
          color: "#000",
          borderRadius: 12,
        }}
      >
        티켓 오픈 사이트 바로가기
      </a>
    </div>
  );
}
