import React, { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-oklch";

const GaussElimination = () => {
  const [rows, setRows] = useState(3);
  const [matrix, setMatrix] = useState(Array.from({ length: 3 }, () => Array(4).fill("")));
  const [steps, setSteps] = useState([]);
  const [solution, setSolution] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleRowChange = (newRows) => {
    const num = parseInt(newRows);
    if (num >= 2 && num <= 5) {
      setRows(num);
      setMatrix(Array.from({ length: num }, () => Array(num + 1).fill("")));
      setSteps([]);
      setSolution([]);
    }
  };

  const handleChange = (i, j, value) => {
    const newMatrix = matrix.map(row => [...row]);
    newMatrix[i][j] = value;
    setMatrix(newMatrix);
  };

  const calculate = () => {
    setSteps([]);
    setSolution([]);
    setLoading(true);

    setTimeout(() => {
      const mat = matrix.map(row => row.map(val => parseFloat(val)));
      const n = mat.length;
      let tempSteps = [];

      for (let k = 0; k < n; k++) {
        // Partial Pivoting
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
          if (Math.abs(mat[i][k]) > Math.abs(mat[maxRow][k])) maxRow = i;
        }
        if (maxRow !== k) {
          [mat[k], mat[maxRow]] = [mat[maxRow], mat[k]];
          tempSteps.push({ text: `Swap row ${k + 1} with row ${maxRow + 1}`, type: "pivot" });
          tempSteps.push({ text: `Matrix: [${mat.map(r => r.join(", ")).join(" | ")}]`, type: "matrix" });
        }

        for (let i = k + 1; i < n; i++) {
          if (mat[k][k] === 0) continue;
          const factor = mat[i][k] / mat[k][k];
          tempSteps.push({ text: `Factor for row ${i + 1} = ${factor.toFixed(6)}`, type: "factor" });
          for (let j = k; j <= n; j++) {
            const oldVal = mat[i][j];
            mat[i][j] -= factor * mat[k][j];
            mat[i][j] = parseFloat(mat[i][j].toFixed(6));
            tempSteps.push({ text: `mat[${i + 1}][${j + 1}] = ${oldVal.toFixed(6)} - ${factor.toFixed(6)}*${mat[k][j].toFixed(6)} = ${mat[i][j].toFixed(6)}`, type: "eliminate" });
          }
          tempSteps.push({ text: `Matrix after eliminating row ${i + 1}: [${mat.map(r => r.join(", ")).join(" | ")}]`, type: "matrix" });
        }
      }

      let x = Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let sum = mat[i][n];
        tempSteps.push({ text: `Back Substitution for x${i + 1}: start with ${sum.toFixed(6)}`, type: "back" });
        for (let j = i + 1; j < n; j++) {
          sum -= mat[i][j] * x[j];
          tempSteps.push({ text: `Subtract mat[${i + 1}][${j + 1}]*x${j + 1} = ${mat[i][j].toFixed(6)}*${x[j].toFixed(6)} => sum = ${sum.toFixed(6)}`, type: "back" });
        }
        x[i] = sum / mat[i][i];
        x[i] = parseFloat(x[i].toFixed(6));
        tempSteps.push({ text: `x${i + 1} = ${sum.toFixed(6)} / ${mat[i][i].toFixed(6)} = ${x[i].toFixed(6)}`, type: "solution" });
      }

      setSteps(tempSteps);
      setSolution(x.map((val, idx) => `x${idx + 1} = ${val}`));
      setLoading(false);
    }, 300);
  };

  const downloadPDF = () => {
    setPdfLoading(true);
    const input = document.getElementById("gauss-result");
    if (!input) return;

    html2canvas(input, { scale: 1, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Gauss_Elimination_Detail.pdf`);
      setPdfLoading(false);
    });
  };

  const clearAll = () => {
    setMatrix(Array.from({ length: rows }, () => Array(rows + 1).fill("")));
    setSteps([]);
    setSolution([]);
  };

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold text-center mb-3">Gauss Elimination Calculator</h1>
      <p className="text-center text-gray-600 mb-5">
        Enter augmented matrix values. Adjust size (2x2 to 5x5)
      </p>

      <div className="mb-5 flex items-center gap-3">
        <label className="font-bold">Matrix size:</label>
        <input
          type="number"
          min={2}
          max={5}
          value={rows}
          onChange={(e) => handleRowChange(e.target.value)}
          className="border p-1 w-16 text-center rounded"
        />
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rows + 1}, 80px)` }}>
        {matrix.map((row, i) =>
          row.map((val, j) => (
            <input
              key={`${i}-${j}`}
              type="number"
              value={val}
              onChange={(e) => handleChange(i, j, e.target.value)}
              className="border p-2 text-center rounded shadow-sm"
              placeholder={`a${i + 1}${j + 1}`}
            />
          ))
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 font-bold" onClick={calculate} disabled={loading}>
          {loading ? "Calculating..." : "Calculate"}
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 font-bold" onClick={clearAll}>
          Clear
        </button>
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold" onClick={downloadPDF} disabled={pdfLoading}>
          {pdfLoading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      <div id="gauss-result" className="mt-5 w-full max-w-xl">
        {steps.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-bold text-lg text-green-700 mb-2">Steps:</h2>
            {steps.map((s, i) => (
              <div
                key={i}
                className={`p-2 rounded shadow-sm ${
                  s.type === "pivot" ? "bg-yellow-100" :
                  s.type === "eliminate" ? "bg-red-100" :
                  s.type === "factor" ? "bg-blue-100" :
                  s.type === "matrix" ? "bg-gray-100" :
                  s.type === "back" ? "bg-purple-100" :
                  s.type === "solution" ? "bg-green-200 font-bold" : "bg-white"
                }`}
              >
                {s.text}
              </div>
            ))}
          </div>
        )}
        {solution.length > 0 && (
          <div className="mt-5 p-3 bg-purple-50 rounded shadow">
            <h2 className="font-bold text-purple-700 text-lg mb-2">Solution:</h2>
            {solution.map((s, i) => (
              <div key={i} className="text-purple-800 font-semibold">{s}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GaussElimination;
