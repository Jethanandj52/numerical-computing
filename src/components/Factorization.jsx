import React, { useState } from "react";

export default function Factorization() {
  const [matrix, setMatrix] = useState([
    [1, 5, 1],
    [2, 1, 3],
    [3, 1, 4],
  ]);
  const [vector, setVector] = useState([14, 13, 17]);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);

  const handleChange = (r, c, val) => {
    const newM = matrix.map((row, i) =>
      row.map((cell, j) => (i === r && j === c ? Number(val) : cell))
    );
    setMatrix(newM);
  };

  const handleVectorChange = (i, val) => {
    const newV = [...vector];
    newV[i] = Number(val);
    setVector(newV);
  };

  const solveLU = () => {
    const A = matrix.map((r) => [...r]);
    const B = [...vector];
    const n = A.length;
    const L = Array.from({ length: n }, () => Array(n).fill(0));
    const U = Array.from({ length: n }, () => Array(n).fill(0));
    const logs = [];

    // Step 1: Initialize L with diagonal 1
    for (let i = 0; i < n; i++) L[i][i] = 1;
    logs.push("STEP 1: Decompose A into L and U\n");

    // Decomposition process
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += L[i][k] * U[k][j];
          logs.push(
            `Adding (L[${i + 1}][${k + 1}] * U[${k + 1}][${j + 1}]) = (${
              L[i][k]
            } * ${U[k][j].toFixed(3)})`
          );
        }
        U[i][j] = A[i][j] - sum;
        logs.push(
          `U[${i + 1}][${j + 1}] = A[${i + 1}][${j + 1}] - sum = ${
            A[i][j]
          } - ${sum.toFixed(3)} = ${U[i][j].toFixed(3)}`
        );
      }

      for (let j = i + 1; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += L[j][k] * U[k][i];
          logs.push(
            `Adding (L[${j + 1}][${k + 1}] * U[${k + 1}][${i + 1}]) = (${
              L[j][k]
            } * ${U[k][i].toFixed(3)})`
          );
        }
        L[j][i] = (A[j][i] - sum) / U[i][i];
        logs.push(
          `L[${j + 1}][${i + 1}] = (A[${j + 1}][${i + 1}] - sum) / U[${i + 1}][${i + 1}] = (${
            A[j][i]
          } - ${sum.toFixed(3)}) / ${U[i][i].toFixed(3)} = ${L[j][i].toFixed(3)}`
        );
      }
      logs.push("-------------------------------------------");
    }

    // Step 2: Forward Substitution (LY = B)
    logs.push("\nSTEP 2: Forward Substitution (Solve LY = B)\n");
    const Y = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let k = 0; k < i; k++) {
        sum += L[i][k] * Y[k];
        logs.push(
          `Adding L[${i + 1}][${k + 1}] * Y[${k + 1}] = ${L[i][k].toFixed(
            3
          )} * ${Y[k].toFixed(3)}`
        );
      }
      Y[i] = B[i] - sum;
      logs.push(`Y[${i + 1}] = B[${i + 1}] - sum = ${B[i]} - ${sum.toFixed(3)} = ${Y[i].toFixed(3)}`);
    }

    // Step 3: Backward Substitution (UX = Y)
    logs.push("\nSTEP 3: Backward Substitution (Solve UX = Y)\n");
    const X = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let k = i + 1; k < n; k++) {
        sum += U[i][k] * X[k];
        logs.push(
          `Adding U[${i + 1}][${k + 1}] * X[${k + 1}] = ${U[i][k].toFixed(
            3
          )} * ${X[k].toFixed(3)}`
        );
      }
      X[i] = (Y[i] - sum) / U[i][i];
      logs.push(
        `X[${i + 1}] = (Y[${i + 1}] - sum) / U[${i + 1}][${i + 1}] = (${
          Y[i].toFixed(3)
        } - ${sum.toFixed(3)}) / ${U[i][i].toFixed(3)} = ${X[i].toFixed(3)}`
      );
    }

    setSteps(logs);
    setResult({ L, U, Y, X });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
      <h1 className="text-3xl font-bold text-center">LU Factorization (Step-by-Step)</h1>

      <div className="grid grid-cols-3 gap-4 border p-4 rounded-xl bg-gray-50 shadow-sm">
        {matrix.map((row, i) => (
          <div key={i} className="flex flex-col space-y-2">
            {row.map((val, j) => (
              <input
                key={j}
                type="number"
                value={val}
                onChange={(e) => handleChange(i, j, e.target.value)}
                className="border rounded-md p-2 text-center w-full"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        {vector.map((val, i) => (
          <input
            key={i}
            type="number"
            value={val}
            onChange={(e) => handleVectorChange(i, e.target.value)}
            className="border rounded-md p-2 w-16 text-center"
          />
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={solveLU}
          className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Solve
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-white shadow p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">Matrix L</h2>
            <table className="border-collapse border mx-auto">
              <tbody>
                {result.L.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className="border px-4 py-2 text-center">
                        {c.toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white shadow p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">Matrix U</h2>
            <table className="border-collapse border mx-auto">
              <tbody>
                {result.U.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className="border px-4 py-2 text-center">
                        {c.toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white shadow p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">Results</h2>
            <p><strong>Y:</strong> {result.Y.map((y) => y.toFixed(3)).join(", ")}</p>
            <p><strong>X (Final Solution):</strong> {result.X.map((x) => x.toFixed(3)).join(", ")}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">Step-by-Step Explanation</h2>
            <pre className="text-sm whitespace-pre-wrap">{steps.join("\n")}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
