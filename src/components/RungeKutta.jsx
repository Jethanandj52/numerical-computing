import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-oklch";

export default function RungeKuttaMethod() {
const [eq, setEq] = useState("x + y");
const [x0, setX0] = useState("0");
const [y0, setY0] = useState("1");
const [h, setH] = useState("0.2");
const [targetX, setTargetX] = useState("0.4");
const [stepsData, setStepsData] = useState([]);
const [finalY, setFinalY] = useState(null);
const [errorMessage, setErrorMessage] = useState("");
const [loading, setLoading] = useState(false);
const [pdfLoading, setPdfLoading] = useState(false);
const resultRef = useRef(null);

function makeEvaluator(expr) {
try {
const fn = new Function("x", "y", `return (${expr});`);
fn(1, 1);
return { ok: true, fn };
} catch (err) {
return { ok: false, error: err.message };
}
}

function formatNumber(n, d = 9) {
if (!isFinite(n)) return String(n);
return Number(n).toFixed(d);
}

const computeRK = () => {
setErrorMessage("");
setStepsData([]);
setFinalY(null);


const x0n = Number(x0);
const y0n = Number(y0);
const hn = Number(h);
const target = Number(targetX);

if (isNaN(x0n) || isNaN(y0n) || isNaN(hn) || isNaN(target)) {
  setErrorMessage("Please enter valid numeric values for x0, y0, h and targetX.");
  return;
}
if (hn <= 0) return setErrorMessage("Step size h must be positive.");
if (target <= x0n) return setErrorMessage("targetX must be greater than x0.");

const evalRes = makeEvaluator(eq);
if (!evalRes.ok) {
  setErrorMessage("Invalid equation: " + evalRes.error);
  return;
}
const f = evalRes.fn;

const n = Math.round((target - x0n) / hn);
let x = x0n;
let y = y0n;
const data = [];
setLoading(true);

for (let i = 0; i < n; i++) {
  const f1 = f(x, y);
  const k1 = hn * f1;

  const x2 = x + hn;
  const y2 = y + k1;
  const f2 = f(x2, y2);
  const k2 = hn * f2;

  const yNext = y + (k1 + k2) / 2;
  const xNext = x + hn;

  data.push({
    step: i + 1,
    x,
    y,
    f1,
    f2,
    k1,
    k2,
    yNext,
    x2,
    y2,
  });

  x = xNext;
  y = yNext;
}

setStepsData(data);
setFinalY({ x, y });
setLoading(false);


};

const downloadPDF = () => {
if (!resultRef.current) return;
setPdfLoading(true);
html2canvas(resultRef.current, { scale: 1, useCORS: true })
.then((canvas) => {
const imgData = canvas.toDataURL("image/png");
const pdf = new jsPDF("p", "mm", "a4");
const pdfWidth = pdf.internal.pageSize.getWidth();
const imgProps = pdf.getImageProperties(imgData);
const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
pdf.save("RungeKutta_Result.pdf");
setPdfLoading(false);
})
.catch((err) => {
console.error("PDF Error:", err);
setPdfLoading(false);
});
};

const clearAll = () => {
setEq("x + y");
setX0("0");
setY0("1");
setH("0.2");
setTargetX("0.4");
setStepsData([]);
setFinalY(null);
setErrorMessage("");
};

return ( <div className="flex flex-col min-h-screen bg-gray-50"> <div className="max-w-4xl mx-auto p-6"> <h1 className="text-3xl font-bold text-center mb-4 text-blue-700">
Runge–Kutta (RK) Step-by-Step Solver </h1> <p className="text-center text-gray-700 mb-4">
Enter dy/dx as an equation using <code>x</code> and <code>y</code>. (e.g.{" "} <code>x + y</code>, <code>x*y</code>, <code>x**2 - y</code>) </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <input
        type="text"
        value={eq}
        onChange={(e) => setEq(e.target.value)}
        className="p-2 border rounded col-span-3"
        placeholder='dy/dx expression, e.g. "x + y"'
      />
      <input
        type="number"
        value={x0}
        onChange={(e) => setX0(e.target.value)}
        className="p-2 border rounded"
        placeholder="x0"
      />
      <input
        type="number"
        value={y0}
        onChange={(e) => setY0(e.target.value)}
        className="p-2 border rounded"
        placeholder="y0"
      />
      <input
        type="number"
        value={h}
        onChange={(e) => setH(e.target.value)}
        className="p-2 border rounded"
        placeholder="Step size h"
      />
    </div>

    <div className="flex gap-3 mb-4">
      <input
        type="number"
        value={targetX}
        onChange={(e) => setTargetX(e.target.value)}
        className="p-2 border rounded w-48"
        placeholder="Target x"
      />
      <button
        onClick={computeRK}
        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Computing..." : "Compute RK"}
      </button>
      <button onClick={clearAll} className="px-4 py-2 bg-gray-200 rounded">
        Clear
      </button>
    </div>

    {errorMessage && <div className="text-red-600 font-bold mb-4">{errorMessage}</div>}

    <div ref={resultRef} className="p-4 border rounded bg-white shadow-sm">
      {stepsData.length === 0 && !finalY && (
        <div className="text-gray-600">
          No calculation yet. Click <b>Compute RK</b>.
        </div>
      )}

      {stepsData.length > 0 && (
        <>
          <div className="mb-4">
            <div className="font-bold text-lg">Given:</div>
            <div>
              dy/dx = <code>{eq}</code>
            </div>
            <div>
              Initial condition: x₀ = {x0}, y₀ = {y0}
            </div>
            <div>Step size: h = {h}</div>
            <div>Steps: {stepsData.length}</div>
          </div>

          <div className="text-left mb-3 font-semibold text-green-700">
            Step-by-step iterations:
          </div>

          {stepsData.map((s) => (
            <div key={s.step} className="mb-4 border-b pb-3">
              <div className="text-blue-700 font-semibold">
                Step {s.step} — at x = {formatNumber(s.x, 6)}, y ={" "}
                {formatNumber(s.y, 9)}
              </div>

              <div className="pl-4 mt-2">
                <div>
                  <b>k₁ = h * f(x, y)</b>
                </div>
                <div className="italic pl-4">
                  Substitute: h * f({formatNumber(s.x, 6)}, {formatNumber(s.y, 6)})
                </div>
                <div className="pl-4">
                  f₁ = {formatNumber(s.f1, 9)}, so k₁ = {formatNumber(s.k1, 9)}
                </div>

                <div className="mt-2">
                  <b>k₂ = h * f(x + h, y + k₁)</b>
                </div>
                <div className="italic pl-4">
                  Substitute: h * f({formatNumber(s.x2, 6)}, {formatNumber(s.y2, 6)})
                </div>
                <div className="pl-4">
                  f₂ = {formatNumber(s.f2, 9)}, so k₂ = {formatNumber(s.k2, 9)}
                </div>

                <div className="mt-3">
                  <b>yₙ₊₁ = yₙ + (k₁ + k₂)/2</b>
                  <div className="pl-4">
                    = {formatNumber(s.y, 9)} + ({formatNumber(s.k1, 9)} +{" "}
                    {formatNumber(s.k2, 9)}) / 2
                  </div>
                  <div className="pl-4 font-semibold">
                    yₙ₊₁ = {formatNumber(s.yNext, 9)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-green-50 rounded border">
            <div className="font-bold">Final computed value:</div>
            <div>x = {formatNumber(finalY.x, 6)}</div>
            <div className="text-lg font-semibold text-green-700">
              y ≈ {formatNumber(finalY.y, 9)}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-blue-700 text-white rounded"
              disabled={pdfLoading}
            >
              {pdfLoading ? "Generating PDF..." : "Download PDF"}
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Print
            </button>
          </div>
        </>
      )}
    </div>
  </div>
</div>


);
}
