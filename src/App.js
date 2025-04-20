// App.js — Full UIUC Transfer Calculator
import React, { useState } from "react";
import "./styles.css";
import { Chart } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Chart as ChartJS,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement);

const majorStats = {
  "Computer Science": {
    tier: "Very Competitive",
    base: 20,
    required: ["Calculus I", "Calculus II", "Intro to CS", "Data Structures"],
    recommended: ["Discrete Math", "Computer Architecture"],
  },
  Business: {
    tier: "Very Competitive",
    base: 25,
    required: ["Microeconomics", "Macroeconomics", "Calculus", "Accounting I"],
    recommended: ["Statistics", "Business Law"],
  },
  Engineering: {
    tier: "Competitive",
    base: 35,
    required: ["Calculus I", "Calculus II", "Physics I"],
    recommended: ["Chemistry", "Linear Algebra"],
  },
  Psychology: {
    tier: "Moderate",
    base: 50,
    required: ["Intro to Psychology", "Statistics"],
    recommended: ["Biology", "Developmental Psych"],
  },
  MCB: {
    tier: "Moderate",
    base: 55,
    required: ["General Chemistry I", "General Chemistry II", "Biology I"],
    recommended: ["Organic Chemistry", "Biology II"],
  },
  History: {
    tier: "Less Competitive",
    base: 70,
    required: ["Western Civ", "US History"],
    recommended: ["World History", "Research Methods"],
  },
  Education: {
    tier: "Open Admission",
    base: 85,
    required: ["Intro to Education"],
    recommended: ["Child Development"],
  },
};

const ecScores = {
  None: 0,
  "Some involvement (1-2 clubs or part-time job)": 2,
  "Strong involvement (leadership, awards, 3+ clubs)": 5,
  "Outstanding (founder, national awards, etc.)": 10,
};

const fakeUsers = Array.from({ length: 200 }, () => {
  const majors = Object.keys(majorStats);
  const major = majors[Math.floor(Math.random() * majors.length)];
  const gpa = (Math.random() * 1.5 + 2.5).toFixed(2);
  return { major, gpa: parseFloat(gpa) };
});

export default function App() {
  const [gpa, setGpa] = useState(3.5);
  const [credits, setCredits] = useState(30);
  const [major, setMajor] = useState("Computer Science");
  const [ecs, setEcs] = useState(
    "Some involvement (1-2 clubs or part-time job)"
  );
  const [result, setResult] = useState(null);
  const [classesTaken, setClassesTaken] = useState({});
  const [rankPercent, setRankPercent] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [essay, setEssay] = useState("");
  const [essayGrade, setEssayGrade] = useState(null);

  const toggleClass = (cls) => {
    setClassesTaken((prev) => ({ ...prev, [cls]: !prev[cls] }));
  };

  const calculateChance = () => {
    const { base, required, recommended } = majorStats[major];
    const gpaFactor = (gpa - 2.5) * 10;
    const creditFactor = credits >= 60 ? 5 : credits >= 30 ? 2 : -5;
    const ecFactor = ecScores[ecs];

    let classFactor = 0;
    const requiredTaken = required.filter((cls) => classesTaken[cls]);
    const recommendedTaken = recommended.filter((cls) => classesTaken[cls]);

    classFactor += requiredTaken.length * 3;
    classFactor += recommendedTaken.length * 1.5;

    const chance = Math.min(
      100,
      Math.max(0, base + gpaFactor + creditFactor + ecFactor + classFactor)
    );
    setResult(Math.round(chance));

    const sameMajor = fakeUsers.filter((u) => u.major === major);
    const betterRank = sameMajor.filter((u) => u.gpa < gpa);
    const rank = Math.round((betterRank.length / sameMajor.length) * 100);
    setRankPercent(rank);

    const sorted = sameMajor.map((u) => u.gpa).sort((a, b) => a - b);
    const labels = sorted.map((_, i) => i + 1);
    setChartData({
      labels,
      datasets: [
        {
          label: `${major} GPA Distribution`,
          data: sorted,
          backgroundColor: sorted.map((v) =>
            v === gpa ? "#ff5f05" : "#13294b"
          ),
        },
      ],
    });
  };

  const gradeEssay = () => {
    const length = essay.trim().split(" ").length;
    let grade;
    if (length < 100) grade = "F";
    else if (length < 200) grade = "D";
    else if (length < 300) grade = "C";
    else if (length < 400) grade = "B";
    else grade = "A";
    setEssayGrade(grade);
  };

  const majorInfo = majorStats[major];

  return (
    <>
      <video autoPlay muted loop id="bgVideo">
        <source
          src="https://cdn.pixabay.com/vimeo/394454159/Quad-UIUC.mp4?width=1280&hash=40f12189e3c9911ba2a98e9874ef038bc90de5b7"
          type="video/mp4"
        />
      </video>
      <div className="container">
        <div className="card">
          <h1>🎓 UIUC Transfer Calculator</h1>

          <label>GPA: {gpa}</label>
          <input
            type="range"
            min="2.5"
            max="4.0"
            step="0.1"
            value={gpa}
            onChange={(e) => setGpa(parseFloat(e.target.value))}
          />

          <label>Credits Completed:</label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
          />

          <label>Major:</label>
          <select value={major} onChange={(e) => setMajor(e.target.value)}>
            {Object.keys(majorStats).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <label>Extracurriculars:</label>
          <select value={ecs} onChange={(e) => setEcs(e.target.value)}>
            {Object.keys(ecScores).map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          <strong>Relevant Courses:</strong>
          {[...majorInfo.required, ...majorInfo.recommended].map((cls) => (
            <label key={cls}>
              <input
                type="checkbox"
                checked={classesTaken[cls] || false}
                onChange={() => toggleClass(cls)}
              />{" "}
              {cls}
            </label>
          ))}

          <button onClick={calculateChance}>Calculate</button>

          {result !== null && (
            <div className="result">
              🎯 Acceptance Chance: <strong>{result}%</strong>
              <br />
              🔢 GPA Rank: Top <strong>{rankPercent}%</strong> of {major}{" "}
              transfers
            </div>
          )}

          {chartData && (
            <div className="chart">
              <Chart
                type="bar"
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          )}

          <hr style={{ marginTop: "2rem" }} />
          <h2>📝 Essay Evaluator</h2>
          <textarea
            rows="6"
            placeholder="Paste your transfer essay here..."
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          ></textarea>
          <button onClick={gradeEssay}>Grade Essay</button>

          {essayGrade && (
            <p className="result">
              Estimated Essay Grade: <strong>{essayGrade}</strong>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
