import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info, Settings, MessageCircle, BookOpen } from 'lucide-react';

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

  const cx = 200;
  const cy = 200;
  const radPrincipal = 130;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">

      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
          <Settings className="mr-3 text-blue-600 animate-spin-slow" />
          Diagrama de Distribución de Válvulas
        </h1>
        <p className="text-slate-600">Herramienta interactiva para calcular y graficar el ciclo teórico y práctico de motores de 4 tiempos.</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* PANEL IZQUIERDO: CONTROLES Y CÁLCULOS */}
        <div className="lg:col-span-12 md:col-span-12 lg:col-span-5 space-y-6">

          {/* Tarjeta de Ingreso de Datos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center border-b pb-2">
              <Info className="mr-2 w-5 h-5 text-slate-500" /> Ingresa los Datos
            </h2>

            <div className="space-y-5">
              {/* Input AAA */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-blue-700 flex items-center" title="Apertura Adelantada de Admisión">
                    AAA <span className="text-xs font-normal text-slate-500 ml-2">(Antes del PMS)</span>
                  </label>
                  <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{aaa}°</span>
                </div>
                <input type="range" min="0" max="90" value={aaa} onChange={(e) => setAaa(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>

              {/* Input RCA */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-blue-700 flex items-center" title="Retraso al Cierre de Admisión">
                    RCA <span className="text-xs font-normal text-slate-500 ml-2">(Después del PMI)</span>
                  </label>
                  <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{rca}°</span>
                </div>
                <input type="range" min="0" max="90" value={rca} onChange={(e) => setRca(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>

              <div className="border-t border-slate-100 my-4"></div>

              {/* Input AAE */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-red-700 flex items-center" title="Apertura Adelantada de Escape">
                    AAE <span className="text-xs font-normal text-slate-500 ml-2">(Antes del PMI)</span>
                  </label>
                  <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{aae}°</span>
                </div>
                <input type="range" min="0" max="90" value={aae} onChange={(e) => setAae(Number(e.target.value))} className="w-full accent-red-600" />
              </div>

              {/* Input RCE */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-red-700 flex items-center" title="Retraso al Cierre de Escape">
                    RCE <span className="text-xs font-normal text-slate-500 ml-2">(Después del PMS)</span>
                  </label>
                  <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{rce}°</span>
                </div>
                <input type="range" min="0" max="90" value={rce} onChange={(e) => setRce(Number(e.target.value))} className="w-full accent-red-600" />
              </div>
            </div>
          </div>

          {/* Tarjeta de Resultados (Fórmulas para el cuaderno) */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-emerald-400 border-b border-slate-700 pb-2 flex items-center">
              <BookOpen className="mr-2 w-5 h-5" /> Resultados para el Cuaderno
            </h2>

            <div className="space-y-4 font-mono text-sm md:text-base">
              <div>
                <p className="text-blue-300 font-sans font-semibold mb-1">Duración Admisión:</p>
                <div className="bg-slate-800 p-3 rounded flex flex-col">
                  <span className="text-slate-400">AAA + 180° + RCA</span>
                  <span>{aaa}° + 180° + {rca}° = <strong className="text-white text-lg">{duracionAdmision}°</strong></span>
                </div>
              </div>

              <div>
                <p className="text-red-300 font-sans font-semibold mb-1">Duración Escape:</p>
                <div className="bg-slate-800 p-3 rounded flex flex-col">
                  <span className="text-slate-400">AAE + 180° + RCE</span>
                  <span>{aae}° + 180° + {rce}° = <strong className="text-white text-lg">{duracionEscape}°</strong></span>
                </div>
              </div>

              <div>
                <p className="text-purple-300 font-sans font-semibold mb-1">Traslape / Solapo:</p>
                <div className="bg-slate-800 p-3 rounded flex flex-col">
                  <span className="text-slate-400">AAA + RCE</span>
                  <span>{aaa}° + {rce}° = <strong className="text-white text-lg">{solapo}°</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: GRÁFICA Y ANIMACIÓN */}
        <div className="lg:col-span-7 flex flex-col space-y-6">

          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex-grow flex flex-col items-center justify-center relative">

            {/* Controles de Animación */}
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
              <button
                onClick={() => { setAnimAngle(0); setIsPlaying(false); }}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                title="Reiniciar"
              >
                <RotateCcw className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-full transition-colors text-white ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                title={isPlaying ? "Pausar" : "Animar Motor"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>

            {/* SVG GRÁFICA PRINCIPAL */}
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px] h-auto drop-shadow-md bg-white mt-4">

              {/* Ejes Principales (PMS - PMI y Horizontal) */}
              <line x1="200" y1="20" x2="200" y2="380" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="20" y1="200" x2="380" y2="200" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" />

              {/* Círculo Base */}
              <circle cx={cx} cy={cy} r={radPrincipal} fill="none" stroke="#e2e8f0" strokeWidth="2" />

              {/* ZONA DE ADMISIÓN (AZUL) */}
              <path
                d={describeArc(cx, cy, radPrincipal + 15, 360 - aaa, 180 + rca)}
                fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.8"
              />
              <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal + 25, 360 - aaa).x} y2={polarToCartesian(cx, cy, radPrincipal + 25, 360 - aaa).y} stroke="#3b82f6" strokeWidth="2" />
              <circle cx={polarToCartesian(cx, cy, radPrincipal + 25, 360 - aaa).x} cy={polarToCartesian(cx, cy, radPrincipal + 25, 360 - aaa).y} r="4" fill="#3b82f6" />
              <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal + 25, 180 + rca).x} y2={polarToCartesian(cx, cy, radPrincipal + 25, 180 + rca).y} stroke="#3b82f6" strokeWidth="2" />
              <circle cx={polarToCartesian(cx, cy, radPrincipal + 25, 180 + rca).x} cy={polarToCartesian(cx, cy, radPrincipal + 25, 180 + rca).y} r="4" fill="#3b82f6" />


              {/* ZONA DE ESCAPE (ROJO) */}
              <path
                d={describeArc(cx, cy, radPrincipal - 15, 180 - aae, rce)}
                fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" opacity="0.8"
              />
              <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal - 25, 180 - aae).x} y2={polarToCartesian(cx, cy, radPrincipal - 25, 180 - aae).y} stroke="#ef4444" strokeWidth="2" />
              <circle cx={polarToCartesian(cx, cy, radPrincipal - 25, 180 - aae).x} cy={polarToCartesian(cx, cy, radPrincipal - 25, 180 - aae).y} r="4" fill="#ef4444" />
              <line x1={cx} y1={cy} x2={polarToCartesian(cx, cy, radPrincipal - 25, rce).x} y2={polarToCartesian(cx, cy, radPrincipal - 25, rce).y} stroke="#ef4444" strokeWidth="2" />
              <circle cx={polarToCartesian(cx, cy, radPrincipal - 25, rce).x} cy={polarToCartesian(cx, cy, radPrincipal - 25, rce).y} r="4" fill="#ef4444" />


              {/* ZONA DE SOLAPO / CRUCE (MORADO) */}
              {solapo > 0 && (
                <path
                  d={describeArc(cx, cy, radPrincipal, 360 - aaa, rce)}
                  fill="none" stroke="#a855f7" strokeWidth="12" strokeLinecap="round" opacity="0.6"
                />
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
              <line
                x1={cx} y1={cy}
                x2={polarToCartesian(cx, cy, radPrincipal + 5, animAngle % 360).x}
                y2={polarToCartesian(cx, cy, radPrincipal + 5, animAngle % 360).y}
                stroke="#0f172a" strokeWidth="3" strokeDasharray="4,2"
              />
              <circle
                cx={polarToCartesian(cx, cy, radPrincipal + 5, animAngle % 360).x}
                cy={polarToCartesian(cx, cy, radPrincipal + 5, animAngle % 360).y}
                r="5" fill="#0f172a"
              />
            </svg>

            {/* Panel inferior de la animación */}
            <div className="w-full mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Ciclo: <strong className="text-slate-800">{Math.floor(animAngle)}° / 720°</strong></span>
                <span className="font-semibold text-indigo-700">{fase}</span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-indigo-600 h-full" style={{ width: `${(animAngle / 720) * 100}%` }}></div>
              </div>

              <div className="flex justify-around text-center text-sm mt-2">
                <div className={`px-4 py-2 rounded-lg border transition-colors ${isAdmOpen ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold shadow-inner' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                  Válvula Admisión<br />{isAdmOpen ? 'ABIERTA' : 'CERRADA'}
                </div>
                <div className={`px-4 py-2 rounded-lg border transition-colors ${isEscOpen ? 'bg-red-100 border-red-300 text-red-800 font-bold shadow-inner' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                  Válvula Escape<br />{isEscOpen ? 'ABIERTA' : 'CERRADA'}
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
      <footer className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-200 flex flex-col items-center">
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
