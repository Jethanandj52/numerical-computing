import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-oklch";

const Cal = () => {
  const [eq, setEq] = useState("");
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const [steps, setSteps] = useState([]);
  const [midSteps, setMidSteps] = useState([]);
  const [decimalPlaces, setDecimalPlaces] = useState();
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [finalRoot, setFinalRoot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [buttonShow, setButtonShow] = useState(false);

  // ✅ New State for Welcome Screen
 

  

  const formatEquation = (equation) => {
    const superscript = {
      "0": "⁰", "1": "¹", "2": "²", "3": "³",
      "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷",
      "8": "⁸", "9": "⁹"
    };

    return equation
      .replace(/\*\*(\d+)/g, (_, exp) =>
        [...exp].map((d) => superscript[d] || d).join("")
      )
      .replace(/\*/g, "");
  };

  function f(x) {
    try {
      return eval(eq.replace(/x/g, `(${x})`));
    } catch {
      return NaN;
    }
  }

  // ✅ Show Welcome Screen First
 

  // ✅ Bisection Calculator (your original code continues here)
  // -------------------------------------------
  const findRoot = () => {
    setErrorMessage("");
    setStatusMessage("");
    setSteps([]);
    setMidSteps([]);
    setFinalRoot(null);

    if (!eq || decimalPlaces === undefined || decimalPlaces < 0) {
      setErrorMessage("❌ Please enter valid equation and decimal places (≥0)!");
      return;
    }

    setLoading(true);
    setButtonShow(true);

    setTimeout(() => {
      let start = 0;
      let end = 1;
      let tempSteps = [];
      let found = false;

      for (let i = 0; i < 50; i++) {
        const fa = f(start);
        const fb = f(end);
        const status = fa * fb < 0 ? "✅ Opposite Sign" : "❌ No Sign Change";

        tempSteps.push({
          iter: i + 1,
          left: start,
          right: end,
          calcA: showCalculation(start),
          calcB: showCalculation(end),
          status
        });

        if (fa === 0 || fb === 0 || fa * fb < 0) {
          setA(start);
          setB(end);
          setStatusMessage(
            fa === 0 ? `✅ Exact root found at x = ${start}` :
            fb === 0 ? `✅ Exact root found at x = ${end}` : ""
          );
          found = true;
          break;
        }
        start = end;
        end = start + 1;
      }

      setSteps(tempSteps);
      if (!found) {
        setA(null);
        setB(null);
        setStatusMessage("❌ No real root found in the given range");
      } else {
        midRoot(start, end);
      }

      setLoading(false);
    }, 500);
  };

  function showCalculation(x) {
    try {
      const substituted = eq.replace(/x/g, `(${x})`);
      const result = eval(substituted);

      let steps = [];
      steps.push(`f(${x}) = ${substituted}`);

      let expanded = substituted.replace(/\(([^)]+)\)\*\*(\d+)/g, (_, base, exp) => {
        const val = Math.pow(parseFloat(base), parseInt(exp));
        return val.toString();
      });
      if (expanded !== substituted) {
        steps.push(`= ${expanded}`);
      }

      let multiplied = expanded.replace(/(\d+(\.\d+)?)\s*\*\s*\(([^)]+)\)/g, (_, a, _1, b) => {
        return (parseFloat(a) * parseFloat(b)).toString();
      });

      multiplied = multiplied.replace(/\(([^)]+)\)\s*\*\s*(\d+(\.\d+)?)/g, (_, a, b) => {
        return (parseFloat(a) * parseFloat(b)).toString();
      });

      multiplied = multiplied.replace(/(\d+(\.\d+)?)\s*\*\s*(\d+(\.\d+)?)/g, (_, a, _1, b) => {
        return (parseFloat(a) * parseFloat(b)).toString();
      });

      if (multiplied !== expanded) {
        steps.push(`= ${multiplied}`);
      }

      steps.push(`= ${result}`);
      return steps;
    } catch {
      return [`f(${x}) = Error`];
    }
  }

  function midRoot(left, right) {
    let stepsArr = [];
    let i = 0;
    const accuracy = 1 / Math.pow(10, decimalPlaces);

    while (Math.abs(right - left) > accuracy) {
      let x = (left + right) / 2;
      stepsArr.push({
        iter: i,
        midA: left,
        midB: right,
        midX: x,
        fX: f(x),
        calcX: showCalculation(x),
        reasoning:
          f(left) * f(x) < 0
            ? `As f(${left}) and f(${x}) are on opposite sides`
            : `As f(${x}) and f(${right}) are on opposite sides`,
        therefore:
          f(left) * f(x) < 0
            ? `Therefore, a real root lies between f(${left}) and f(${x})`
            : `Therefore, a real root lies between f(${x}) and f(${right})`,
      });

      if (f(left) * f(x) < 0) right = x;
      else left = x;
      i++;
    }

    const finalX = (left + right) / 2;
    stepsArr.push({
      iter: i,
      midA: left,
      midB: right,
      midX: finalX,
      fX: f(finalX),
      calcX: showCalculation(finalX),
      reasoning: "Stopping as f(x) is within the desired accuracy",
      therefore:
        f(left) * f(finalX) < 0
          ? `Therefore, a real root lies between f(${left}) and f(${finalX})`
          : `Therefore, a real root lies between f(${finalX}) and f(${right})`,
    });

    setMidSteps(stepsArr);
    setFinalRoot(finalX.toFixed(decimalPlaces));
  }

  const downloadPDF = () => {
    setPdfLoading(true);
    const input = document.getElementById("bisection-result");
    if (!input) return;

    html2canvas(input, { scale: 1, useCORS: true })
      .then((canvas) => {
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

        pdf.save(`${eq} Bisection_Result.pdf`);
        setPdfLoading(false);
      })
      .catch((err) => {
        console.error("PDF generation error:", err);
        setPdfLoading(false);
      });
  };

  const clearAll = () => {
    setEq("");
    setA(null);
    setB(null);
    setSteps([]);
    setMidSteps([]);
    setDecimalPlaces();
    setStatusMessage("");
    setErrorMessage("");
    setFinalRoot(null);
    setButtonShow(false);
  };

  // ✅ Calculator UI continues here (same as your original code)...
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <div>
        <h1 className="text-3xl font-bold text-center text-white w-full bg-gradient-to-r from-gray-900 to-gray-800 py-6 shadow-inner">
          Bisection Calculator
        </h1>

        <div className="flex flex-col md:flex-row justify-center items-center gap-5 mt-10 px-4">
          <input
            type="text"
            placeholder="Enter equation like x**3 - x**2 + x - 7"
            className="p-2 border rounded w-full md:w-96 border-green-500"
            value={eq}
            onChange={(e) => setEq(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Decimal places"
            className="p-2 border rounded w-full md:w-32 border-green-500"
            value={decimalPlaces || ""}
            min={0}
            onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
            required
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
        {loading && <div className="text-center mt-5 text-blue-600 font-bold text-lg">⏳ Please wait... Calculating</div>}

        <div id="bisection-result" className="p-5">
          {statusMessage && !loading && (
            <div className={`mt-5 text-center font-bold ${statusMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
              {statusMessage}
            </div>
          )}

          {a !== null && b !== null && a !== b && !loading && (
            <div className="mt-5 text-center text-lg">
              <div><b>Question: Find root of {formatEquation(eq)} by Bisection Method. Accuracy up to {decimalPlaces} decimal places.</b></div>
              <div className="text-left p-5 text-blue-800"><b>Solution:</b></div>
              <div className="font-bold text-2xl">Let f(x) = {formatEquation(eq)}</div>
              <div className="font-bold text-left p-2 text-green-700">Step 1: Finding Root Interval</div>

              {steps.map((item, index) => (
                <div key={index} className="pl-10 space-y-2 border-b pb-2 mt-2 text-left">
                  <div className="text-blue-700">Put the value of <b>a</b> = {item.left} and <b>b</b> = {item.right}</div>

                  <div><b>f(a):  {formatEquation(eq)}</b> {item.calcA.map((s, i) => <div key={i}>{formatEquation(s)}</div>)}</div>
                  <div><b>f(b):  {formatEquation(eq)}</b> {item.calcB.map((s, i) => <div key={i}>{formatEquation(s)}</div>)}</div>
                  <div><b>Status:</b> {item.status}</div>
                </div>
              ))}

              <div className="text-green-700 font-bold p-5 pl-10">
                ✅ Therefore, a real root lies between a = {a} and b = {b}
              </div>
            </div>
          )}

          {!loading && midSteps.length > 0 && (
            <>
              <div className="font-bold text-left pl-10 text-green-700">Step 2: Bisection Iteration</div>
              {midSteps.map((step, idx) => (
                <div key={idx} className="pl-10 space-y-1 border-b pb-2 mt-2 text-left">
                  <div className="text-blue-700"><b>Iteration {step.iter + 1}</b></div>
                  <div>a = {step.midA}, b = {step.midB}</div>
                  <div className="text-green-700"><b>Formula:</b> x = (a + b) / 2</div>
                  <div>x = ({step.midA} + {step.midB}) / 2 = {step.midX}</div>
                  <div><b>f(x): {formatEquation(eq)}</b> {step.calcX.map((s, i) => <div key={i}>{formatEquation(s)}</div>)}</div>
                  <div className="italic text-purple-700">
                    {step.fX > 0
                      ? `Since f(x) > 0, b is updated to mid (b = ${step.midX})`
                      : `Since f(x) < 0, a is updated to mid (a = ${step.midX})`}
                  </div>
                  <div className="text-green-700"><b>{step.therefore}</b></div>
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

export default Cal;
