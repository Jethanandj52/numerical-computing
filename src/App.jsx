import React, { useState } from 'react'
import Cal from './components/Cal'
import Footer from './components/Footer'
import RungeKutta from './components/RungeKutta'
import Factorization from './components/Factorization'
import RegulaFalsi from './components/RegulaFalsi'
import SecantCalculator from './components/SecantCalculator' // ✅ import Secant
import GaussElimination from './components/GaussElimination'
import JacobiMethod from './components/JacobiMethod'
import GaussSeidel from './components/GaussSeidel'

const App = () => {
  const [activePage, setActivePage] = useState('bisection') // default page (Cal)

  // Button style helper
  const getButtonStyle = (page) => ({
    margin: '5px',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    cursor: 'pointer',
    backgroundColor: activePage === page ? '#2563eb' : '#f3f4f6', // blue for active
    color: activePage === page ? 'white' : 'black',
    fontWeight: activePage === page ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
  })

  return (
    <>
      {/* 🔘 Header Navigation */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '30px',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
          Numerical Methods Solver
        </h1>
        <p style={{ color: '#6b7280' }}>
          Select a method to solve your equation
        </p>
      </div>

      {/* 🔘 Navigation Buttons */}
     {/* 🔘 Navigation Buttons */}
<div className="grid gap-4 justify-center max-w-5xl mx-auto mb-10
                grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
  <button
    onClick={() => setActivePage('bisection')}
    className={`py-2 px-4 rounded border transition-all font-bold
                ${activePage === 'bisection' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-100'}`}
  >
    Bisection Method
  </button>

  <button
    onClick={() => setActivePage('regula')}
    className={`py-2 px-4 rounded border transition-all font-bold
                ${activePage === 'regula' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-100'}`}
  >
    Regula Falsi Method
  </button>

  <button
    onClick={() => setActivePage('runge')}
    className={`py-2 px-4 rounded border transition-all font-bold
                ${activePage === 'runge' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-100'}`}
  >
    Runge Kutta Method
  </button>

  <button
    onClick={() => setActivePage('fact')}
    className={`py-2 px-4 rounded border transition-all font-bold
                ${activePage === 'fact' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-100'}`}
  >
    Factorization Method
  </button>

  <button
    onClick={() => setActivePage('secant')}
    className={`py-2 px-4 rounded border transition-all font-bold
                ${activePage === 'secant' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-100'}`}
  >
    Secant Method
  </button>

  <button
    onClick={() => setActivePage('guass')}
    className={`py-2 px-4 rounded border transition-all font-bold
                ${activePage === 'guass' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-100'}`}
  >
    Gauss Elimination
  </button>

  <button
    onClick={() => setActivePage('jacobi')}
    className={`py-2 px-4 rounded border transition-all font-bold
                ${activePage === 'jacobi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-100'}`}
  >
    Gauss Jacobi
  </button>

  <button
    onClick={() => setActivePage('seidel')}
    className={`py-2 px-4 rounded border transition-all font-bold
                ${activePage === 'seidel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-100'}`}
  >
    Gauss Seidel
  </button>
</div>


      {/* 🧮 Conditional Rendering */}
      <div style={{ padding: '20px', minHeight: '60vh' }}>
        {activePage === 'bisection' && <Cal />}
        {activePage === 'regula' && <RegulaFalsi />}
        {activePage === 'runge' && <RungeKutta />}
        {activePage === 'fact' && <Factorization />}
        {activePage === 'secant' && <SecantCalculator />} {/* ✅ Secant component */}
        {activePage==='guass'&& <GaussElimination/>}
        {activePage==='jacobi'&& <JacobiMethod/>}
         {activePage==='seidel'&& <GaussSeidel/>}
      </div>

      {/* ⚙️ Footer */}
      <Footer />
    </>
  )
}

export default App
