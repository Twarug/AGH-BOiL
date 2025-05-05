// src/components/gantt-chart-dialog.tsx
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
// Poprawiony import - zakładam, że CPM_Node jest w Graph.ts
import { CPM_Graph, CPM_Node } from "@/lib/Graph";

type GanttChartDialogProps = {
  data: CPM_Graph;
  onClose: () => void;
}

// Funkcja pomocnicza do dodawania dni do daty
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  // Używamy setDate - bezpiecznie obsługuje przejścia między miesiącami/latami
  result.setDate(result.getDate() + days);
  return result;
}

// Definicja kolumn dla Google Charts Gantt - bez zmian
const ganttColumns = [
  { type: "string", label: "Task ID" },
  { type: "string", label: "Task Name" },
  { type: "date", label: "Start Date" },
  { type: "date", label: "End Date" },
  { type: "number", label: "Duration" }, // Czas trwania w milisekundach
  { type: "number", label: "Percent Complete" },
  { type: "string", label: "Dependencies" },
];


export default function GanttChartDialog({ data, onClose }: GanttChartDialogProps) {

  const ganttData = useMemo(() => {
    if (!data || !data.nodes) return [];

    // Ustawiamy datę bazową - dzisiaj, godzina 00:00:00
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const chartData = data.nodes.map((node: CPM_Node) => {
      // Obliczamy datę startu na podstawie ES (liczba dni od baseDate)
      const startDate = addDays(baseDate, node.es);

      // Obliczamy datę końca na podstawie EF (liczba dni od baseDate)
      // Dla zadań o zerowym czasie trwania (kamienie milowe), data końca = data startu
      const endDate = node.duration > 0 ? addDays(baseDate, node.ef) : startDate;

      // Obliczamy czas trwania w MILISEKUNDACH (wymagane przez Google Charts dla tej kolumny)
      // 1 dzień = 24 * 60 * 60 * 1000 ms
      // Dla zadań o zerowym czasie trwania, durationMs = 0
      const durationMs = node.duration > 0 ? node.duration * 24 * 60 * 60 * 1000 : 0;

      // Zależności - ID poprzedników jako string (bez zmian)
      const dependencies = node.predecessors.length > 0
        ? node.predecessors.map(pId => pId.toString()).join(',')
        : null; // Używamy null dla braku zależności

      // Zwracamy tablicę z danymi dla wiersza, upewniając się, że typy pasują do ganttColumns
      return [
        node.id.toString(),          // Kolumna 0: string
        node.name,                   // Kolumna 1: string
        startDate,                   // Kolumna 2: Date object
        endDate,                     // Kolumna 3: Date object
        durationMs,                  // Kolumna 4: number (milisekundy) <-- POPRAWKA
        node.critical ? 100 : 0,     // Kolumna 5: number (0-100)
        dependencies,                // Kolumna 6: string lub null
      ];
    });

    // Dodajemy nagłówek kolumn (etykiety) jako pierwszy wiersz
    const headers = ganttColumns.map(col => col.label);
    return [headers, ...chartData];

  }, [data]);

  // Opcje konfiguracji wykresu Gantta (bez zmian)
  const ganttOptions = useMemo(() => ({ // Opakowujemy w useMemo dla stabilności referencji
    height: data.nodes.length * 41 + 50,
    gantt: {
      trackHeight: 40,
      barHeight: 25,
      criticalPathEnabled: false, // Wyłączamy wbudowane, bo sami kolorujemy
      arrow: {
        angle: 100,
        width: 1,
        color: '#757575',
        radius: 0
      },
       palette: [
        { // Styl dla zadań niekrytycznych (percent complete = 0)
          "color": "#64b5f6",
          "dark": "#1976d2",
          "light": "#e3f2fd"
        },
        { // Styl dla zadań krytycznych (percent complete = 100)
          "color": "#ef5350",
          "dark": "#d32f2f",
          "light": "#ffcdd2"
        }
      ]
    },
  }), [data.nodes.length]); // Zależność od liczby nodów dla wysokości

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl md:max-w-6xl lg:max-w-7xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center mb-4">
            Wykres Gantta
          </DialogTitle>
        </DialogHeader>

        <div className="w-full">
          {ganttData.length > 1 ? (
            <Chart
              chartType="Gantt"
              width="100%"
              // Używamy key, aby wymusić re-render przy zmianie danych (czasem pomaga)
              key={JSON.stringify(ganttData)}
              height={ganttOptions.height}
              data={ganttData}
              options={ganttOptions}
              loader={<div>Ładowanie wykresu...</div>}
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