import React, { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-oklch";

const GaussSeidel = () => {
  const [rows, setRows] = useState(3);
  const [matrix, setMatrix] = useState(Array.from({ length: 3 }, () => Array(4).fill("")));
  const [tolerance, setTolerance] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(50);
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
      const n = matrix.length;
      const mat = matrix.map(row => row.map(val => parseFloat(val)));
      let x = Array(n).fill(0);
      let tempSteps = [];
      let iter = 0;

      while (iter < maxIter) {
        let x_new = [...x];
        tempSteps.push(`Iteration ${iter + 1}:`);
        for (let i = 0; i < n; i++) {
          let sum = mat[i][n];
          for (let j = 0; j < n; j++) {
            if (j !== i) sum -= mat[i][j] * x_new[j];
          }
          x_new[i] = parseFloat((sum / mat[i][i]).toFixed(6));
          tempSteps.push(`x${i + 1} = (${mat[i][n]} - sum of other terms)/${mat[i][i]} = ${x_new[i]}`);
        }

        // Check convergence
        const error = x_new.map((val, idx) => Math.abs(val - x[idx]));
        tempSteps.push(`Errors: [${error.map(e => e.toFixed(6)).join(", ")}]`);
        x = x_new;
        iter++;
        if (Math.max(...error) < tolerance) break;
      }

      setSteps(tempSteps);
      setSolution(x.map((val, idx) => `x${idx + 1} = ${val}`));
      setLoading(false);
    }, 300);
  };

  const downloadPDF = () => {
    setPdfLoading(true);
    const input = document.getElementById("seidel-result");
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

      pdf.save(`Gauss_Seidel_Result.pdf`);
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
      <h1 className="text-3xl font-bold text-center mb-3">Gauss-Seidel Calculator</h1>

      <div className="mb-5 flex gap-3 items-center">
        <label>Matrix size:</label>
        <input
          type="number"
          min={2}
          max={5}
          value={rows}
          onChange={(e) => handleRowChange(e.target.value)}
          className="border p-1 w-16 text-center"
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
              className="border p-2 text-center"
              placeholder={`a${i + 1}${j + 1}`}
            />
          ))
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 font-bold"
          onClick={calculate}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 font-bold"
          onClick={clearAll}
        >
          Clear
        </button>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold"
          onClick={downloadPDF}
          disabled={pdfLoading}
        >
          {pdfLoading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      <div id="seidel-result" className="mt-5 text-left w-full max-w-xl">
        {steps.length > 0 && (
          <div>
            <h2 className="font-bold text-lg text-green-700">Steps:</h2>
            {steps.map((s, i) => (
              <div key={i} className="ml-5">{s}</div>
            ))}
          </div>
        )}
        {solution.length > 0 && (
          <div className="mt-3 font-bold text-purple-700">
            <h2>Solution:</h2>
            {solution.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GaussSeidel;
