import './App.css'
import { ThemeProvider } from './components/theme-provider';
import CpmTable from './components/cpm-table.tsx'
import { useState } from 'react';
import { Switch } from './components/ui/switch.tsx';
import { CPM_Data, CPM_Graph, generate_CPM_graph } from './lib/Graph.ts';
import CpmGraph from './components/cpm-graph.tsx';
import finalTable from './components/final-table.tsx';
import { Button } from './components/ui/button.tsx';

function App() {
  const [isAOA, setIsAOA] = useState(false);
  const [dispTable, setDispTable] = useState(false);
  const [cpmResult, setCpmResult] = useState<CPM_Graph | null>(null);

  const onCreateCPM = (data: CPM_Data[]) => {
    console.log("Dane wejsciowe:", data);
    if(data && data.length > 0) {
      try {
        //const graph = mockCpmGraph; //mock to test graph generation
        const graph = generate_CPM_graph(data, isAOA ? "AOA" : "AON"); // Uncomment this line to use the actual data
        console.log("Wygenerowany graf:", graph);
        setCpmResult(graph);
      } catch (error) {
        console.error("Błąd podczas generowania grafu:", error);
        setCpmResult(null);
      }
    }else {
      console.error("Brak danych do przetworzenia.");
      setCpmResult(null);
    }
  }

  const onDisplayTable = () => {
    setDispTable(true);
  } 

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className="w-full h-full flex justify-between">
        {/* Left side - CPM table and calculator */}
        <div>
          <h1 className='text-2xl font-bold mb-2'>CPM Calculator</h1>
          <div className='flex gap-4 items-center py-4'>
            <p className='text-2xl'>AON</p>
            <Switch checked={isAOA} onCheckedChange={setIsAOA}/>
            <p className='text-2xl'>AOA</p>
          </div>
          <CpmTable isAOA={isAOA} onCreateCPM={onCreateCPM}/>
          {cpmResult && <div className='w-full flex justify-center mt-4'>
             <Button type="button" className='mx-auto' onClick={onDisplayTable}>Show table</Button>
          </div>}
        </div>
        {/* Right side - CPM graph */}
        <div className="flex-1 flex flex-col min-w-0 ml-6">
            <h2 className='text-xl font-semibold mb-2 text-neutral-300'>Diagram CPM</h2>
            <div className="flex-1 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                {cpmResult ? (
                    <CpmGraph graphData={cpmResult} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-neutral-500 text-center px-4">
                            Wprowadź dane w tabeli po lewej i kliknij "Calculate CPM", aby wygenerować diagram.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>
      {dispTable && finalTable({data: cpmResult!, onClose: () => setDispTable(false)})}
    </ThemeProvider>
  )
}

export default App
