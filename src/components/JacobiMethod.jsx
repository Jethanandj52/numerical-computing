import React, { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-oklch";

const JacobiMethod = () => {
  const [rows, setRows] = useState(3);
  const [matrix, setMatrix] = useState(Array.from({ length: 3 }, () => Array(4).fill("")));
  const [steps, setSteps] = useState([]);
  const [solution, setSolution] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [tolerance, setTolerance] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(50);

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

  const calculateJacobi = () => {
    setSteps([]);
    setSolution([]);
    setLoading(true);

    setTimeout(() => {
      const n = matrix.length;
      const mat = matrix.map(row => row.map(val => parseFloat(val)));
      let xOld = Array(n).fill(0);
      let xNew = Array(n).fill(0);
      let tempSteps = [];

      for (let iter = 0; iter < maxIter; iter++) {
        for (let i = 0; i < n; i++) {
          let sum = mat[i][n]; // constant term
          for (let j = 0; j < n; j++) {
            if (i !== j) sum -= mat[i][j] * xOld[j];
          }
          xNew[i] = parseFloat((sum / mat[i][i]).toFixed(6));
        }

        // Record iteration step
        tempSteps.push({
          iter: iter + 1,
          values: [...xNew]
        });

        // Check convergence
        let error = xNew.map((val, i) => Math.abs(val - xOld[i]));
        if (Math.max(...error) < tolerance) break;

        xOld = [...xNew];
      }

      setSteps(tempSteps);
      setSolution(xNew.map((val, idx) => `x${idx + 1} = ${val}`));
      setLoading(false);
    }, 300);
  };

  const downloadPDF = () => {
    setPdfLoading(true);
    const input = document.getElementById("jacobi-result");
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

      pdf.save(`Jacobi_Result.pdf`);
      setPdfLoading(false);
    });
  };

  const clearAll = () => {
    setMatrix(Array.from({ length: rows }, () => Array(rows + 1).fill("")));
    setSteps([]);
    setSolution([]);
  };

  return (
    <div className="flex flex-col items-center p-5 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-5 text-gray-900">Jacobi Method Calculator</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-5 items-center">
        <label className="font-semibold">Matrix size:</label>
        <input
          type="number"
          min={2}
          max={5}
          value={rows}
          onChange={(e) => handleRowChange(e.target.value)}
          className="border p-2 rounded w-20 text-center"
        />
        <input
          type="number"
          min={0.00001}
          step={0.00001}
          placeholder="Tolerance"
          value={tolerance}
          onChange={(e) => setTolerance(parseFloat(e.target.value))}
          className="border p-2 rounded w-32 text-center"
        />
      </div>

      <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: `repeat(${rows + 1}, 80px)` }}>
        {matrix.map((row, i) =>
          row.map((val, j) => (
            <input
              key={`${i}-${j}`}
              type="number"
              value={val}
              onChange={(e) => handleChange(i, j, e.target.value)}
              className="border p-2 rounded shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`a${i + 1}${j + 1}`}
            />
          ))
        )}
      </div>

      <div className="flex gap-3 mb-5">
        <button
          className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-600 active:scale-95 transition"
          onClick={calculateJacobi}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-500 active:scale-95 transition"
          onClick={clearAll}
        >
          Clear
        </button>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded font-bold hover:bg-blue-600 active:scale-95 transition"
          onClick={downloadPDF}
          disabled={pdfLoading}
        >
          {pdfLoading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      <div id="jacobi-result" className="w-full max-w-3xl">
        {steps.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-green-700 mb-2">Iterations:</h2>
            {steps.map((s, i) => (
              <div key={i} className="p-3 rounded shadow-sm bg-blue-50 border-l-4 border-blue-500">
                <div className="font-bold text-purple-700">Iteration {s.iter}</div>
                <div className="pl-5 space-y-1">
                  {s.values.map((val, idx) => (
                    <div key={idx}>x{idx + 1} = {val}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {solution.length > 0 && (
          <div className="mt-5 p-5 bg-green-50 rounded shadow">
            <h2 className="text-xl font-bold text-green-700 mb-3">Final Solution:</h2>
            {solution.map((s, i) => (
              <div key={i} className="text-green-800 font-semibold text-lg">{s}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JacobiMethod;
