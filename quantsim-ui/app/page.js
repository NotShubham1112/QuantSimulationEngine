'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Dynamically import heavy components to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function QuantSimDashboard() {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'results'
  const [script, setScript] = useState("# Paste your AI-generated strategy here...");
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to run the simulation
  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/run-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_code: script })
      });
      const data = await response.json();
      setSimulationData(data);
      setActiveTab('results'); // Auto-switch to results
    } catch (error) {
      console.error("Simulation failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      
      {/* LEFT PANEL: AI Chat */}
      <div className="w-1/3 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 font-bold text-xl">QuantSim AI</div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Chat Messages Component would go here */}
          <div className="bg-slate-800 p-3 rounded mb-2">User: Create a Moving Average Crossover strategy.</div>
          <div className="bg-blue-900 p-3 rounded mb-2">AI: Sure. I have generated the Python script. Please check the Editor tab.</div>
        </div>
        <div className="p-4 border-t border-slate-700">
           <input type="text" placeholder="Ask AI to modify strategy..." className="w-full bg-slate-800 p-2 rounded text-white" />
        </div>
      </div>

      {/* RIGHT PANEL: Workbench */}
      <div className="w-2/3 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-slate-700 flex items-center px-4 gap-4 bg-slate-800">
          <button onClick={() => setActiveTab('editor')} className={`px-4 py-1 rounded ${activeTab === 'editor' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>Code Editor</button>
          <button onClick={() => setActiveTab('results')} className={`px-4 py-1 rounded ${activeTab === 'results' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>Simulation Results</button>
          <button onClick={handleRunSimulation} className="ml-auto bg-green-600 hover:bg-green-700 px-6 py-1 rounded font-bold">
            {loading ? 'Running...' : '▶ Run Simulation'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* EDITOR TAB */}
          <div className={`${activeTab === 'editor' ? 'block' : 'hidden'} h-full`}>
            <Editor 
              height="100%" 
              defaultLanguage="python" 
              theme="vs-dark" 
              value={script}
              onChange={(value) => setScript(value)}
            />
          </div>

          {/* RESULTS TAB */}
          {activeTab === 'results' && simulationData && (
            <div className="h-full flex flex-col overflow-y-auto p-4 space-y-4">
              
              {/* 1. The 3-Case Scenarios */}
              <div className="grid grid-cols-3 gap-4">
                <ScenarioCard title="Best Case" value={simulationData.scenarios.best_case} color="text-green-400" />
                <ScenarioCard title="Base Case" value={simulationData.scenarios.avg_case} color="text-blue-400" />
                <ScenarioCard title="Worst Case" value={simulationData.scenarios.worst_case} color="text-red-400" />
              </div>

              {/* 2. Interactive Chart */}
              <div className="bg-slate-800 p-2 rounded border border-slate-700 h-96">
                <Plot
                  data={[
                    {
                      x: simulationData.charts.dates,
                      y: simulationData.charts.equity,
                      type: 'scatter',
                      mode: 'lines',
                      marker: { color: '#4ade80' },
                    },
                  ]}
                  layout={{ 
                    title: 'Portfolio Equity Curve', 
                    paper_bgcolor: 'rgba(0,0,0,0)', 
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: 'white' },
                    autosize: true
                  }}
                  useResizeHandler={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {/* 3. AI Reasoning */}
              <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <h3 className="font-bold text-lg mb-2 text-yellow-400">Analysis & Reasoning</h3>
                <p className="text-gray-300">{simulationData.ai_reasoning}</p>
              </div>

              {/* 4. Excel-Like Grid */}
              <div className="ag-theme-alpine-dark h-96 w-full">
                <AgGridReact
                  rowData={simulationData.excel_grid}
                  columnDefs={[
                    { field: "date", filter: true },
                    { field: "signal" },
                    { field: "price", valueFormatter: p => '$' + p.value.toFixed(2) },
                    { field: "pnl", cellStyle: params => ({ color: params.value > 0 ? '#4ade80' : '#f87171' }) },
                    { field: "reason", flex: 1 }
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple Helper Component for Scenarios
function ScenarioCard({ title, value, color }) {
  return (
    <div className="bg-slate-800 p-4 rounded border border-slate-700 text-center">
      <div className="text-gray-400 text-sm uppercase tracking-wider">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>${value?.toLocaleString()}</div>
    </div>
  );
}