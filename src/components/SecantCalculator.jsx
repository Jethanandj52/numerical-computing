import React, { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-oklch";

const SecantCalculator = () => {
  const [eq, setEq] = useState("");
  const [x0, setX0] = useState("");
  const [x1, setX1] = useState("");
  const [decimalPlaces, setDecimalPlaces] = useState();
  const [steps, setSteps] = useState([]);
  const [finalRoot, setFinalRoot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonShow, setButtonShow] = useState(false);

  const formatEquation = (equation) => {
    const superscript = {
      "0": "⁰","1": "¹","2": "²","3": "³",
      "4": "⁴","5": "⁵","6": "⁶","7": "⁷",
      "8": "⁸","9": "⁹"
    };
    return equation.replace(/\*\*(\d+)/g, (_, exp) =>
      [...exp].map(d => superscript[d] || d).join("")
    ).replace(/\*/g, "");
  };

  const f = (x) => {
    try {
      return eval(eq.replace(/x/g, `(${x})`));
    } catch {
      return NaN;
    }
  };

  const showCalculation = (x) => {
    try {
      const substituted = eq.replace(/x/g, `(${x})`);
      const result = eval(substituted);
      return [`f(${x}) = ${substituted} = ${result}`];
    } catch {
      return [`f(${x}) = Error`];
    }
  };

  const findRoot = () => {
    setErrorMessage("");
    setSteps([]);
    setFinalRoot(null);

    if (!eq || decimalPlaces === undefined || decimalPlaces < 0 || x0 === "" || x1 === "") {
      setErrorMessage("❌ Please enter equation, x0, x1 and decimal places correctly!");
      return;
    }

    setLoading(true);
    setButtonShow(true);

    setTimeout(() => {
      let a = parseFloat(x0);
      let b = parseFloat(x1);
      let tempSteps = [];
      const accuracy = 1 / Math.pow(10, decimalPlaces);
      let iter = 0;
      let rootFound = false;

      while (Math.abs(b - a) > accuracy && iter < 50) {
        const fa = f(a);
        const fb = f(b);
        if (fb - fa === 0) break; // avoid division by zero
        const c = b - fb * (b - a) / (fb - fa);

        tempSteps.push({
          iter: iter + 1,
          x0: a,
          x1: b,
          fX0: fa,
          fX1: fb,
          nextX: c,
          calcX: showCalculation(c),
        });

        if (Math.abs(f(c)) < accuracy) {
          rootFound = true;
          b = c;
          break;
        }

        a = b;
        b = c;
        iter++;
      }

      setSteps(tempSteps);
      if (rootFound || Math.abs(f(b)) < accuracy) {
        setFinalRoot(b.toFixed(decimalPlaces));
      } else {
        setFinalRoot("Root not found in 50 iterations");
      }

      setLoading(false);
    }, 300);
  };

  const downloadPDF = () => {
    setPdfLoading(true);
    const input = document.getElementById("secant-result");
    if (!input) return;

    html2canvas(input, { scale: 1, useCORS: true })
      .then(canvas => {
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

        pdf.save(`${eq} Secant_Result.pdf`);
        setPdfLoading(false);
      })
      .catch(err => {
        console.error("PDF generation error:", err);
        setPdfLoading(false);
      });
  };

  const clearAll = () => {
    setEq(""); setX0(""); setX1(""); setDecimalPlaces(); setSteps([]);
    setFinalRoot(null); setErrorMessage(""); setButtonShow(false);
  };

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <div>
        <h1 className="text-3xl font-bold text-center text-white w-full bg-gradient-to-r from-gray-900 to-gray-800 py-6 shadow-inner">
          Secant Method Calculator
        </h1>

        <div className="flex flex-col md:flex-row justify-center items-center gap-5 mt-10 px-4">
          <input
            type="text"
            placeholder="Enter equation like x**3 - x**2 + x - 7"
            className="p-2 border rounded w-full md:w-96 border-green-500"
            value={eq}
            onChange={(e) => setEq(e.target.value)}
          />
          <input
            type="number"
            placeholder="x0"
            className="p-2 border rounded w-full md:w-32 border-green-500"
            value={x0}
            onChange={(e) => setX0(e.target.value)}
          />
          <input
            type="number"
            placeholder="x1"
            className="p-2 border rounded w-full md:w-32 border-green-500"
            value={x1}
            onChange={(e) => setX1(e.target.value)}
          />
          <input
            type="number"
            placeholder="Decimal places"
            className="p-2 border rounded w-full md:w-32 border-green-500"
            value={decimalPlaces || ""}
            min={0}
            onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
          />
          <button
            className="bg-green-700 rounded text-white px-4 py-2 cursor-pointer active:scale-90 transition-all hover:bg-green-600 hover:text-black font-bold w-full md:w-auto"
            onClick={findRoot}
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
          <button
            className="bg-red-600 rounded text-white px-4 py-2 cursor-pointer active:scale-90 transition-all hover:bg-red-500 font-bold w-full md:w-auto"
            onClick={clearAll}
          >
            Clear
          </button>
        </div>

        {errorMessage && <div className="text-center mt-5 text-red-600 font-bold text-lg">{errorMessage}</div>}

        <div id="secant-result" className="p-5">
          {steps.length > 0 && (
            <>
              <div className="font-bold text-left pl-10 text-green-700">Secant Iterations:</div>
              {steps.map((step, idx) => (
                <div key={idx} className="pl-10 space-y-1 border-b pb-2 mt-2 text-left">
                  <div className="text-blue-700"><b>Iteration {step.iter}</b></div>
                  <div>x0 = {step.x0}, x1 = {step.x1}</div>
                  <div>f(x0) = {step.fX0}, f(x1) = {step.fX1}</div>
                  <div>Next x = {step.nextX}</div>
                  {step.calcX.map((s, i) => <div key={i}>{formatEquation(s)}</div>)}
                </div>
              ))}
              {finalRoot && (
                <div className="text-center mt-5 text-2xl font-bold text-purple-700">
                  ✅ Final Root: x = {finalRoot}
                </div>
              )}
            </>
          )}
        </div>

        {buttonShow && (
          <div className="mt-5 text-center flex justify-center pb-10">
            <button
              onClick={downloadPDF}
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-90 transition-all"
              disabled={pdfLoading}
            >
              {pdfLoading ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecantCalculator;
