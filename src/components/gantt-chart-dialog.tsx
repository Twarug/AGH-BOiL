import { useMemo } from 'react';
import { Chart } from "react-google-charts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CPM_Graph, CPM_Node } from "@/lib/Graph";

type GanttChartDialogProps = {
  data: CPM_Graph;
  onClose: () => void;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const ganttColumns = [
  { type: "string", label: "Task ID" },
  { type: "string", label: "Task Name" },
  { type: "string", label: "Resource" },
  { type: "date", label: "Start Date" },
  { type: "date", label: "End Date" },
  { type: "number", label: "Duration" },
  { type: "number", label: "Percent Complete" },
  { type: "string", label: "Dependencies" },
];


export default function GanttChartDialog({ data, onClose }: GanttChartDialogProps) {

  const { ganttData, minStartDate, maxEndDate } = useMemo(() => {
    if (!data || !data.nodes || data.nodes.length === 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      return {
          ganttData: [ganttColumns.map(col => col.label)],
          minStartDate: today,
          maxEndDate: addDays(today, 1)
      };
    }

    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    let overallMinStartDate = new Date(8640000000000000);
    let overallMaxEndDate = new Date(-8640000000000000);

    const chartData = data.nodes.map((node: CPM_Node) => {
      const startDate = addDays(baseDate, node.es);
      const endDate = node.ef > node.es ? addDays(baseDate, node.ef) : startDate;
      const durationMs = node.duration > 0 ? node.duration * 24 * 60 * 60 * 1000 : 0;
      const dependencies = node.predecessors.length > 0
        ? node.predecessors.map(pId => pId.toString()).join(',')
        : null;
      const resource = node.critical ? 'Krytyczne' : 'Normalne';


      if (startDate < overallMinStartDate) {
        overallMinStartDate = startDate;
      }
      if (endDate > overallMaxEndDate) {
        overallMaxEndDate = endDate;
      }
      if (overallMaxEndDate < overallMinStartDate) {
          overallMaxEndDate = overallMinStartDate;
      }

      return [
        node.id.toString(), node.name, resource, startDate, endDate, durationMs,
        node.critical ? 100 : 0, dependencies,
      ];
    });

    const headers = ganttColumns.map(col => col.label);
     if (overallMinStartDate.getTime() === new Date(8640000000000000).getTime()) {
         overallMinStartDate = baseDate;
     }
     if (overallMaxEndDate.getTime() === new Date(-8640000000000000).getTime()) {
         overallMaxEndDate = addDays(baseDate, 1);
     }

    return { ganttData: [headers, ...chartData], minStartDate: overallMinStartDate, maxEndDate: overallMaxEndDate };

  }, [data]);

  const ganttOptions = useMemo(() => {
    const ticks = [];
    const tickIntervalDays = 3; 
    const paddingDaysEnd = 7;
    const finalTickDate = addDays(maxEndDate, paddingDaysEnd);
    let currentTickDate = new Date(minStartDate);

    while (currentTickDate <= finalTickDate) {
      ticks.push(new Date(currentTickDate));
      currentTickDate = addDays(currentTickDate, tickIntervalDays);
    }
    if (ticks.length === 0 || ticks[ticks.length - 1] < finalTickDate) {
        if (ticks.length === 0 || addDays(ticks[ticks.length - 1], tickIntervalDays / 2) < finalTickDate) {
             ticks.push(finalTickDate);
        }
    }

    return {
      height: data.nodes.length * 41 + 50,
      backgroundColor: '#1f2937',
      gantt: {
        trackHeight: 40,
        barHeight: 25,
        criticalPathEnabled: true,
        criticalPathStyle: { stroke: '#ef4444', strokeWidth: 3 },
        palette: [
          { "color": "#ef4444", "dark": "#dc2626", "light": "#fecaca" },
          { "color": "#a1a1aa", "dark": "#71717a", "light": "#d4d4d8" }
        ],
        barCornerRadius: 4,
        arrow: { angle: 100, width: 1, color: '#9ca3af', radius: 0 },
        labelStyle: { color: '#e5e7eb' },
        innerGridTrack: { fill: '#374151' },
        innerGridDarkTrack: { fill: '#4b5563' },
      },
      hAxis: {
        textStyle: { color: '#f9fafb' },
        ticks: ticks,
        format: 'MMM d'
      },
      vAxis: {
          textStyle: { color: '#f9fafb' }
      }
    };
  }, [data.nodes.length, minStartDate, maxEndDate]);

  return (
     <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl md:max-w-6xl lg:max-w-7xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center mb-4">
            Wykres Gantta
          </DialogTitle>
        </DialogHeader>
        <div className="w-full overflow-x-auto bg-gray-800 p-2 rounded">
          {ganttData.length > 1 ? (
            <Chart
              chartType="Gantt"
              width="100%" 
              key={JSON.stringify(ganttData)}
              height={ganttOptions.height}
              data={ganttData}
              options={ganttOptions}
              loader={<div>Ładowanie wykresu...</div>}
              chartPackages={['gantt']}
            />
          ) : (
            <p className="text-center text-neutral-500">Brak danych do wyświetlenia wykresu Gantta.</p>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={onClose}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}