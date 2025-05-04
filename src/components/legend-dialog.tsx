import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  
  type LegendDialogProps = {
    onClose: () => void;
  }
  
  export default function LegendDialog({ onClose }: LegendDialogProps) {
    const cellClasses = 'border border-neutral-500 px-1.5 py-1 min-w-[50px] box-border text-center text-xs';
    const nodeClasses = `
      w-[180px] rounded-md text-white bg-neutral-700  // Nieco inny bg dla odróżnienia
      border-2 border-neutral-400 mb-6 mx-auto // Wyśrodkowanie i margines dolny
    `;
  
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center mb-4">
              Legenda Węzła CPM
            </DialogTitle>
          </DialogHeader>
          <div className={nodeClasses}>
            {/* Górny wiersz: ES, T, EF */}
            <div className="flex justify-between">
              <div className={cellClasses}>ES</div>
              <div className={`${cellClasses} font-bold`}>T</div>
              <div className={cellClasses}>EF</div>
            </div>
            {/* Środkowy wiersz: Nazwa/ID */}
            <div className="flex justify-between border-t border-b border-neutral-500">
              <div className={`${cellClasses} flex-grow border-l-0 border-r-0 font-bold text-sm`}>
                Nazwa / ID
              </div>
            </div>
            {/* Dolny wiersz: LS, R, LF */}
            <div className="flex justify-between">
              <div className={cellClasses}>LS</div>
              <div className={cellClasses}>R</div>
              <div className={cellClasses}>LF</div>
            </div>
          </div>  
          <div className="space-y-2 text-sm text-neutral-300">
            <p><span className="font-semibold text-white">ES</span> (Earliest Start): Najwcześniejszy możliwy czas rozpoczęcia zadania.</p>
            <p><span className="font-semibold text-white">T</span> (Time / Duration): Czas trwania zadania.</p>
            <p><span className="font-semibold text-white">EF</span> (Earliest Finish): Najwcześniejszy możliwy czas zakończenia zadania (ES + T).</p>
            <p><span className="font-semibold text-white">LS</span> (Latest Start): Najpóźniejszy możliwy czas rozpoczęcia zadania bez opóźniania projektu (LF - T).</p>
            <p><span className="font-semibold text-white">R</span> (Reserve / Slack / Float): Rezerwa czasowa; o ile można opóźnić zadanie bez wpływu na czas końca projektu (LS - ES lub LF - EF).</p>
            <p><span className="font-semibold text-white">LF</span> (Latest Finish): Najpóźniejszy możliwy czas zakończenia zadania bez opóźniania projektu.</p>
            <p className="mt-3"><span className="font-semibold text-red-500">Czerwona ramka</span>: Oznacza zadanie na ścieżce krytycznej (R = 0).</p>
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