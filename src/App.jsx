import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info, Settings, MessageCircle, BookOpen, AlertTriangle } from 'lucide-react';

export default function App() {
  const [aaa, setAaa] = useState(15);
  const [rca, setRca] = useState(60);
  const [aae, setAae] = useState(50);
  const [rce, setRce] = useState(10);

  const [animAngle, setAnimAngle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const requestRef = useRef();

  const duracionAdmision = aaa + 180 + rca;
  const duracionEscape = aae + 180 + rce;
  const solapo = aaa + rce;

  const animate = () => {
    setAnimAngle(prevAngle => {
      let nextAngle = prevAngle + 2;
      if (nextAngle >= 720) nextAngle = 0;
      return nextAngle;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    let diff = (endAngle - startAngle + 360) % 360;
    if (diff === 0 && startAngle !== endAngle) diff = 360;

    const largeArcFlag = diff <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
  };

  const getFaseActual = () => {
    let angle = animAngle;

    let isAdmOpen = (angle >= (720 - aaa) || angle <= (180 + rca));
    let isEscOpen = (angle >= (540 - aae) || angle <= rce);

    let fase = "";
    if (angle >= 0 && angle < 180) fase = "Admisión (Pistón bajando)";
    else if (angle >= 180 && angle < 360) fase = "Compresión (Pistón subiendo)";
    else if (angle >= 360 && angle < 540) fase = "Expansión / Trabajo (Pistón bajando)";
    else if (angle >= 540 && angle <= 720) fase = "Escape (Pistón subiendo)";

    return { fase, isAdmOpen, isEscOpen };
  };

  const { fase, isAdmOpen, isEscOpen } = getFaseActual();

  const getWarnings = () => {
    const warnings = [];
    if (solapo > 40) {
      warnings.push("⚠️ Alto Solapo (>40°): Riesgo mecánico de choque entre válvulas y pistón. Ralentí extremadamente inestable y pérdida de vacío.");
    } else if (solapo > 25) {
      warnings.push("🔸 Solapo Deportivo (>25°): Configuración racing. Ralentí inestable pero excelente rendimiento en altas RPM.");
    }

    if (rce > 30) {
      warnings.push("⚠️ RCE Peligroso (>30°): Riesgo de quemar la válvula de escape y retorno de gases al colector de admisión.");
    }

    if (rca > 65) {
      warnings.push("⚠️ RCA Excesivo (>65°): Pérdida drástica de compresión inicial (reflujo) a bajas RPM. Motor 'muerto' en baja.");
    }

    if (warnings.length === 0) {
      warnings.push("✅ Configuración Segura: Ángulos dentro de lo normal para calle o uso moderado. Sin riesgos inminentes de daños.");
    }
    return warnings;
  };

  const hazards = getWarnings();

  const cx = 200;
  const cy = 200;
  const radPrincipal = 130;

  // Lógica de Piston Animation
  const pistonWidth = 80;
  const pistonHeight = 50;
  const crankRadius = 40;
  const rodLength = 120;
  const pistonCx = 150;
  const pistonCy = 300; // Centro del cigüeñal

  // Ángulo para el cigüeñal (0° = Top Dead Center, apuntando hacia arriba)
  const crankAngleRad = (animAngle - 90) * Math.PI / 180;
  const pinX = pistonCx + crankRadius * Math.cos(crankAngleRad);
  const pinY = pistonCy + crankRadius * Math.sin(crankAngleRad);

  // Posición del pistón usando la fórmula de la biela
  const dx = pistonCx - pinX;
  const dy_sq = rodLength * rodLength - dx * dx;
  const wristPinY = pinY - Math.sqrt(dy_sq);

  const pistonY = wristPinY - (pistonHeight / 2);

  // Colores de la mezcla según la fase
  let gasColor = "transparent";
  let showSpark = false;
  if (animAngle >= 0 && animAngle < 180) gasColor = "#e0f2fe"; // Admisión (Mezcla fría)
  else if (animAngle >= 180 && animAngle < 360) gasColor = "#c7d2fe"; // Compresión (Mezcla calentándose)
  else if (animAngle >= 360 && animAngle < 540) { gasColor = "#fed7aa"; } // Expansión / Trabajo (Fuego)
  else if (animAngle >= 540 && animAngle <= 720) gasColor = "#f1f5f9"; // Escape (Gases quemados)

  if (animAngle >= 355 && animAngle <= 365) showSpark = true; // Chispa justo en PMS

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
          <Settings className="mr-3 text-blue-600 animate-spin-slow" />
          Diagrama de Distribución de Válvulas
        </h1>
        <p className="text-slate-600">Herramienta interactiva para calcular y graficar el ciclo teórico y práctico de motores de 4 tiempos.</p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

        {/* PANEL IZQUIERDO: CONTROLES Y CÁLCULOS */}
        <div className="col-span-1 lg:col-span-4 space-y-6">

          {/* Tarjeta de Ingreso de Datos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center border-b pb-2">
              <Info className="mr-2 w-5 h-5 text-slate-500" /> Ingresa los Datos
            </h2>

            <div className="space-y-6">
              {/* Input AAA */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-blue-700 flex items-center" title="Apertura Adelantada de Admisión">
                    AAA <span className="text-xs font-normal text-slate-500 ml-2">(Antes PMS)</span>
                  </label>
                  <div className="flex items-center">
                    <input type="number" min="0" max="90" value={aaa} onChange={(e) => setAaa(Number(e.target.value))} className="w-16 font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-blue-800 text-sm ml-1 font-mono">°</span>
                  </div>
                </div>
                <input type="range" min="0" max="90" step="1" value={aaa} onChange={(e) => setAaa(Number(e.target.value))} onInput={(e) => setAaa(Number(e.target.value))} className="w-full h-2 cursor-pointer accent-blue-600" />
              </div>

              {/* Input RCA */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-blue-700 flex items-center" title="Retraso al Cierre de Admisión">
                    RCA <span className="text-xs font-normal text-slate-500 ml-2">(Después PMI)</span>
                  </label>
                  <div className="flex items-center">
                    <input type="number" min="0" max="90" value={rca} onChange={(e) => setRca(Number(e.target.value))} className="w-16 font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-blue-800 text-sm ml-1 font-mono">°</span>
                  </div>
                </div>
                <input type="range" min="0" max="90" step="1" value={rca} onChange={(e) => setRca(Number(e.target.value))} onInput={(e) => setRca(Number(e.target.value))} className="w-full h-2 cursor-pointer accent-blue-600" />
              </div>

              <div className="border-t border-slate-100 my-4"></div>

              {/* Input AAE */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-red-700 flex items-center" title="Apertura Adelantada de Escape">
                    AAE <span className="text-xs font-normal text-slate-500 ml-2">(Antes PMI)</span>
                  </label>
                  <div className="flex items-center">
                    <input type="number" min="0" max="90" value={aae} onChange={(e) => setAae(Number(e.target.value))} className="w-16 font-mono bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <span className="text-red-800 text-sm ml-1 font-mono">°</span>
                  </div>
                </div>
                <input type="range" min="0" max="90" step="1" value={aae} onChange={(e) => setAae(Number(e.target.value))} onInput={(e) => setAae(Number(e.target.value))} className="w-full h-2 cursor-pointer accent-red-600" />
              </div>

              {/* Input RCE */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-red-700 flex items-center" title="Retraso al Cierre de Escape">
                    RCE <span className="text-xs font-normal text-slate-500 ml-2">(Después PMS)</span>
                  </label>
                  <div className="flex items-center">
                    <input type="number" min="0" max="90" value={rce} onChange={(e) => setRce(Number(e.target.value))} className="w-16 font-mono bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <span className="text-red-800 text-sm ml-1 font-mono">°</span>
                  </div>
                </div>
                <input type="range" min="0" max="90" step="1" value={rce} onChange={(e) => setRce(Number(e.target.value))} onInput={(e) => setRce(Number(e.target.value))} className="w-full h-2 cursor-pointer accent-red-600" />
              </div>
            </div>
          </div>

          {/* Tarjeta de Resultados (Fórmulas para el cuaderno) */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-emerald-400 border-b border-slate-700 pb-2 flex items-center">
              <BookOpen className="mr-2 w-5 h-5" /> Resultados Cuaderno
            </h2>

            <div className="space-y-4 font-mono text-sm md:text-base">
              <div>
                <p className="text-blue-300 font-sans font-semibold mb-1">Duración Admisión:</p>
                <div className="bg-slate-800 p-3 rounded flex flex-col">
                  <span className="text-slate-400 opacity-70">AAA + 180° + RCA</span>
                  <span>{aaa}° + 180° + {rca}° = <strong className="text-white text-lg">{duracionAdmision}°</strong></span>
                </div>
              </div>

              <div>
                <p className="text-red-300 font-sans font-semibold mb-1">Duración Escape:</p>
                <div className="bg-slate-800 p-3 rounded flex flex-col">
                  <span className="text-slate-400 opacity-70">AAE + 180° + RCE</span>
                  <span>{aae}° + 180° + {rce}° = <strong className="text-white text-lg">{duracionEscape}°</strong></span>
                </div>
              </div>

              <div>
                <p className="text-purple-300 font-sans font-semibold mb-1">Traslape / Solapo:</p>
                <div className="bg-slate-800 p-3 rounded flex flex-col">
                  <span className="text-slate-400 opacity-70">AAA + RCE</span>
                  <span>{aaa}° + {rce}° = <strong className="text-white text-lg">{solapo}°</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* ANALIZADOR DE PELIGROS */}
          <div className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200">
            <h2 className="text-xl font-bold mb-4 flex items-center border-b border-amber-200 pb-2 text-amber-900">
              <AlertTriangle className="mr-2 w-5 h-5 text-amber-600" /> Prevención de Daños
            </h2>
            <ul className="space-y-3">
              {hazards.map((hazard, index) => (
                <li key={index} className="text-sm text-amber-900 bg-white p-3 rounded shadow-sm border border-amber-100">
                  {hazard}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* PANEL DERECHO: GRÁFICA Y ANIMACIÓN */}
        <div className="col-span-1 lg:col-span-8 flex flex-col space-y-6">

          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex-grow relative overflow-hidden">

            {/* Controles de Animación */}
            <div className="absolute top-4 right-4 flex space-x-2 z-10 bg-white/80 p-1 rounded-full backdrop-blur-sm shadow-sm border border-slate-100">
              <button
                onClick={() => { setAnimAngle(0); setIsPlaying(false); }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Reiniciar"
              >
                <RotateCcw className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-full transition-colors text-white shadow-md ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                title={isPlaying ? "Pausar" : "Animar Motor"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-around w-full h-full pb-8">

              {/* SVG 1: GRÁFICA CIRCULAR DE DISTRIBUCIÓN */}
              <div className="w-full max-w-[350px] flex flex-col items-center">
                <h3 className="font-bold text-slate-700 mb-2">Diagrama Circular</h3>
                <svg viewBox="0 0 400 400" className="w-full h-auto drop-shadow-sm">
                  {/* Ejes Principales (PMS - PMI y Horizontal) */}
                  <line x1="200" y1="20" x2="200" y2="380" stroke="#cbd5e1" strokeWidth="2" />
                  <line x1="20" y1="200" x2="380" y2="200" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" />

                  {/* Círculo Base */}
                  <circle cx={cx} cy={cy} r={radPrincipal} fill="none" stroke="#e2e8f0" strokeWidth="2" />

                  {/* ZONA DE ADMISIÓN (AZUL) */}
                  <path d={describeArc(cx, cy, radPrincipal + 15, 360 - aaa, 180 + rca)} fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                  <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal + 25, 360 - aaa).x} y2={polarToCartesian(cx, cy, radPrincipal + 25, 360 - aaa).y} stroke="#3b82f6" strokeWidth="2" />
                  <circle cx={polarToCartesian(cx, cy, radPrincipal + 25, 360 - aaa).x} cy={polarToCartesian(cx, cy, radPrincipal + 25, 360 - aaa).y} r="4" fill="#3b82f6" />
                  <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal + 25, 180 + rca).x} y2={polarToCartesian(cx, cy, radPrincipal + 25, 180 + rca).y} stroke="#3b82f6" strokeWidth="2" />
                  <circle cx={polarToCartesian(cx, cy, radPrincipal + 25, 180 + rca).x} cy={polarToCartesian(cx, cy, radPrincipal + 25, 180 + rca).y} r="4" fill="#3b82f6" />

                  {/* ZONA DE ESCAPE (ROJO) */}
                  <path d={describeArc(cx, cy, radPrincipal - 15, 180 - aae, rce)} fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                  <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal - 25, 180 - aae).x} y2={polarToCartesian(cx, cy, radPrincipal - 25, 180 - aae).y} stroke="#ef4444" strokeWidth="2" />
                  <circle cx={polarToCartesian(cx, cy, radPrincipal - 25, 180 - aae).x} cy={polarToCartesian(cx, cy, radPrincipal - 25, 180 - aae).y} r="4" fill="#ef4444" />
                  <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal - 25, rce).x} y2={polarToCartesian(cx, cy, radPrincipal - 25, rce).y} stroke="#ef4444" strokeWidth="2" />
                  <circle cx={polarToCartesian(cx, cy, radPrincipal - 25, rce).x} cy={polarToCartesian(cx, cy, radPrincipal - 25, rce).y} r="4" fill="#ef4444" />

                  {/* ZONA DE SOLAPO / CRUCE (MORADO) */}
                  {solapo > 0 && (
                    <path d={describeArc(cx, cy, radPrincipal, 360 - aaa, rce)} fill="none" stroke="#a855f7" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
                  )}

                  {/* Centro del cigüeñal */}
                  <circle cx={cx} cy={cy} r="6" fill="#475569" />

                  {/* ETIQUETAS DE TEXTO */}
                  <text x={cx} y="30" textAnchor="middle" className="font-bold text-sm fill-slate-700">PMS (0°)</text>
                  <text x={cx} y="380" textAnchor="middle" className="font-bold text-sm fill-slate-700">PMI (180°)</text>

                  {/* Etiquetas dinámicas de ángulos */}
                  <text x={polarToCartesian(cx, cy, radPrincipal + 40, 360 - aaa).x} y={polarToCartesian(cx, cy, radPrincipal + 40, 360 - aaa).y + 5} textAnchor="middle" className="text-xs font-bold fill-blue-600">AAA {aaa}°</text>
                  <text x={polarToCartesian(cx, cy, radPrincipal + 40, 180 + rca).x} y={polarToCartesian(cx, cy, radPrincipal + 40, 180 + rca).y + 5} textAnchor="middle" className="text-xs font-bold fill-blue-600">RCA {rca}°</text>
                  <text x={polarToCartesian(cx, cy, radPrincipal - 40, 180 - aae).x} y={polarToCartesian(cx, cy, radPrincipal - 40, 180 - aae).y + 5} textAnchor="middle" className="text-xs font-bold fill-red-600">AAE {aae}°</text>
                  <text x={polarToCartesian(cx, cy, radPrincipal - 40, rce).x} y={polarToCartesian(cx, cy, radPrincipal - 40, rce).y + 5} textAnchor="middle" className="text-xs font-bold fill-red-600">RCE {rce}°</text>
                  {solapo > 0 && (
                    <text x={cx} y={cy - radPrincipal + 30} textAnchor="middle" className="text-[10px] font-bold fill-purple-700 bg-white">Solapo {solapo}°</text>
                  )}

                  {/* ANIMACIÓN: Puntero del cigüeñal */}
                  <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal + 5, animAngle % 360).x} y2={polarToCartesian(cx, cy, radPrincipal + 5, animAngle % 360).y} stroke="#0f172a" strokeWidth="3" strokeDasharray="4,2" />
                  <circle cx={polarToCartesian(cx, cy, radPrincipal + 5, animAngle % 360).x} cy={polarToCartesian(cx, cy, radPrincipal + 5, animAngle % 360).y} r="5" fill="#0f172a" />
                </svg>
              </div>

              {/* SVG 2: SIMULACIÓN DE PISTÓN Y VÁLVULAS */}
              <div className="w-full max-w-[280px] flex flex-col items-center">
                <h3 className="font-bold text-slate-700 mb-2">Simulación del Cilindro</h3>
                <svg viewBox="0 0 300 380" className="w-full h-auto drop-shadow-md bg-stone-50 rounded-xl border border-slate-200">

                  {/* Bloque del Motor / Cilindro (Fondo interno coloreado por gas) */}
                  <rect x="110" y="80" width={pistonWidth} height="150" fill={gasColor} className="transition-colors duration-100" />

                  {/* Paredes del cilindro */}
                  <line x1="110" y1="80" x2="110" y2="280" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                  <line x1="190" y1="80" x2="190" y2="280" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                  <line x1="110" y1="80" x2="190" y2="80" stroke="#475569" strokeWidth="6" strokeLinecap="round" />

                  {/* CHISPA! */}
                  {showSpark && (
                    <circle cx="150" cy="85" r="10" fill="#facc15" className="animate-pulse" />
                  )}

                  {/* Válvula de Admisión (Izquierda) */}
                  <g transform={`translate(0, ${isAdmOpen ? 15 : 0})`} className="transition-transform duration-75">
                    {/* Canal de admisión */}
                    <path d="M 80 40 L 130 40 L 130 80" fill="none" stroke="#e0f2fe" strokeWidth="20" />
                    {/* Flecha flujo entrada */}
                    {isAdmOpen && <path d="M 90 40 L 110 40 L 100 50 Z" fill="#3b82f6" opacity="0.5" />}
                    {/* Válvula física */}
                    <line x1="130" y1="30" x2="130" y2="80" stroke="#94a3b8" strokeWidth="4" />
                    <line x1="120" y1="80" x2="140" y2="80" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                  </g>

                  {/* Válvula de Escape (Derecha) */}
                  <g transform={`translate(0, ${isEscOpen ? 15 : 0})`} className="transition-transform duration-75">
                    {/* Canal de escape */}
                    <path d="M 220 40 L 170 40 L 170 80" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                    {/* Flecha flujo salida */}
                    {isEscOpen && <path d="M 190 40 L 180 30 L 180 50 Z" fill="#ef4444" opacity="0.5" />}
                    {/* Válvula física */}
                    <line x1="170" y1="30" x2="170" y2="80" stroke="#94a3b8" strokeWidth="4" />
                    <line x1="160" y1="80" x2="180" y2="80" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                  </g>

                  {/* PISTÓN */}
                  <rect x={110 + 2} y={pistonY} width={pistonWidth - 4} height={pistonHeight} fill="#cbd5e1" rx="4" stroke="#64748b" strokeWidth="2" />
                  {/* Anillos del pistón */}
                  <line x1={112} y1={pistonY + 10} x2={188} y2={pistonY + 10} stroke="#475569" strokeWidth="2" />
                  <line x1={112} y1={pistonY + 20} x2={188} y2={pistonY + 20} stroke="#475569" strokeWidth="2" />

                  {/* BIELA Y BULÓN */}
                  {/* Bulón */}
                  <circle cx={pistonCx} cy={wristPinY} r="6" fill="#475569" />
                  {/* Biela (Conecta el centro del pistón al cigueñal) */}
                  <line x1={pistonCx} y1={wristPinY} x2={pinX} y2={pinY} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
                  <line x1={pistonCx} y1={wristPinY} x2={pinX} y2={pinY} stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />

                  {/* CIGÜEÑAL */}
                  {/* Centro del cigüeñal */}
                  <circle cx={pistonCx} cy={pistonCy} r="15" fill="#475569" />
                  <circle cx={pistonCx} cy={pistonCy} r="6" fill="#1e293b" />
                  {/* Brazo del cigüeñal */}
                  <line x1={pistonCx} y1={pistonCy} x2={pinX} y2={pinY} stroke="#64748b" strokeWidth="16" strokeLinecap="round" />
                  {/* Muñequilla */}
                  <circle cx={pinX} cy={pinY} r="8" fill="#1e293b" />
                  {/* Trayectoria circular del cigüeñal (dash array) */}
                  <circle cx={pistonCx} cy={pistonCy} r={crankRadius} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />

                  {/* Etiquetas de las vías */}
                  <text x="80" y="25" textAnchor="middle" className="text-[10px] font-bold fill-blue-600">Admisión</text>
                  <text x="220" y="25" textAnchor="middle" className="text-[10px] font-bold fill-red-600">Escape</text>
                </svg>
              </div>

            </div>

            {/* Panel inferior de la animación - Estado Global */}
            <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-slate-500 font-mono">Ángulo Cigüeñal: <strong className="text-slate-800 text-lg">{Math.floor(animAngle)}°</strong> <span className="text-xs">/ 720°</span></span>
                <span className="font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">{fase}</span>
              </div>

              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-5">
                <div className="bg-indigo-600 h-full transition-all duration-75" style={{ width: `${(animAngle / 720) * 100}%` }}></div>
              </div>

              <div className="flex gap-4 text-center text-xs sm:text-sm">
                <div className={`flex-1 py-2 sm:py-3 rounded-xl border transition-all ${isAdmOpen ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold shadow-inner' : 'bg-white border-slate-200 text-slate-400'}`}>
                  Válvula Admisión<br /><span className="text-base">{isAdmOpen ? 'ABIERTA' : 'CERRADA'}</span>
                </div>
                <div className={`flex-1 py-2 sm:py-3 rounded-xl border transition-all ${isEscOpen ? 'bg-red-100 border-red-300 text-red-800 font-bold shadow-inner' : 'bg-white border-slate-200 text-slate-400'}`}>
                  Válvula Escape<br /><span className="text-base">{isEscOpen ? 'ABIERTA' : 'CERRADA'}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl text-sm text-slate-700">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center"><Info className="w-4 h-4 mr-1" /> Glosario de Ayuda</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li><strong className="text-blue-600">AAA:</strong> Adelanto de Apertura de Admisión</li>
              <li><strong className="text-blue-600">RCA:</strong> Retraso de Cierre de Admisión</li>
              <li><strong className="text-red-600">AAE:</strong> Adelanto de Apertura de Escape</li>
              <li><strong className="text-red-600">RCE:</strong> Retraso de Cierre de Escape</li>
              <li><strong className="text-purple-600">Solapo:</strong> Momento donde ambas válvulas están abiertas a la vez.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FOOTER & BOTON CONTACTO */}
      <footer className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200 flex flex-col items-center">
        <a
          href="https://wa.me/50588378547"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center bg-[#25D366] hover:bg-[#1ebd5a] text-white px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all mb-4"
        >
          <MessageCircle className="mr-2 w-5 h-5" />
          Contactar al desarrollador (Javier Astaroth)
        </a>
        <p className="text-slate-500 text-sm text-center">
          Desarrollado específicamente para facilitar los ejercicios de mecánica automotriz.
        </p>
      </footer>

    </div>
  );
}
