import './App.css'
import { ThemeProvider } from './components/theme-provider';
import CpmTable from './components/cpm-table.tsx'
import { useState } from 'react';
import { Switch } from './components/ui/switch.tsx';
import { CPM_Data } from './lib/Graph.ts';

function App() {
  const [isAOA, setIsAOA] = useState(false);

  const onCreateCPM = (data: CPM_Data[]) => {
    console.log(data);
  }

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className="w-full flex justify-between">
        <div>
          <h1 className='text-2xl font-bold mb-2'>CPM Calculator</h1>
          <div className='flex gap-4 items-center py-4'>
            <p className='text-2xl'>AON</p>
            <Switch checked={isAOA} onCheckedChange={setIsAOA}/>
            <p className='text-2xl'>AOA</p>
          </div>
          <CpmTable isAOA={isAOA} onCreateCPM={onCreateCPM}/>
        </div>
        <div>
          {/* Graph place */}
          <p>Graph</p>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
