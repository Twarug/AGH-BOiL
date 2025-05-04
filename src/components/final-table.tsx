import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CPM_Graph } from "@/lib/Graph";
import { cn } from "@/lib/utils";

type FinalTableProps = {
  data: CPM_Graph;
  onClose: () => void;
};

export default function FinalTable({ data, onClose }: FinalTableProps) {
  const isAOA = data.type === "AOA";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center mb-4">
            Final CPM Table ({isAOA ? "AOA" : "AON"})
          </DialogTitle>
        </DialogHeader>

        <div className="w-full border border-gray-400 rounded-lg overflow-hidden shadow-sm">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="bg-muted text-muted-foreground">
                {isAOA ? (
                  <>
                    <TableHead className="text-center px-4 py-3">From</TableHead>
                    <TableHead className="text-center px-4 py-3">To</TableHead>

                  </>
                ) : (
                  <>
                    <TableHead className="text-center px-4 py-3">ID</TableHead>
                  </>
                )}
                  <TableHead className="text-center px-4 py-3">Task Name</TableHead>
                  <TableHead className="text-center px-4 py-3">Duration</TableHead>
                  <TableHead className="text-center px-4 py-3">ES</TableHead>
                  <TableHead className="text-center px-4 py-3">EF</TableHead>
                  <TableHead className="text-center px-4 py-3">LS</TableHead>
                  <TableHead className="text-center px-4 py-3">LF</TableHead>
                  <TableHead className="text-center px-4 py-3">Reserve</TableHead>
                  <TableHead className="text-center px-4 py-3">Critical Path</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isAOA
                ? data.nodes.flatMap((node) =>
                    node.successors.map((succ, i) => {
                      const target = data.nodes.find((n) => n.id === succ.index);
                      const from = node.id;
                      const to = succ.index;
                      const name = succ.activity?.name ?? `Task ${from}-${to}`;
                      const duration = succ.activity?.duration ?? 0;
                      const es = node.es;
                      const ef = es + duration;
                      const lf = target?.lf ?? 0;
                      const ls = lf - duration;
                      const isCritical = es === ls && ef === lf;

                      return {
                        from,
                        to,
                        name,
                        duration,
                        es,
                        ef,
                        ls,
                        lf,
                        isCritical,
                        element: (
                          <TableRow key={`aoa-${node.id}-${succ.index}-${i}`} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="text-center px-4 py-3">{from}</TableCell>
                            <TableCell className="text-center px-4 py-3">{to}</TableCell>
                            <TableCell className="text-center px-4 py-3">{name}</TableCell>
                            <TableCell className="text-center px-4 py-3">{duration}</TableCell>
                            <TableCell className="text-center px-4 py-3">{es}</TableCell>
                            <TableCell className="text-center px-4 py-3">{ef}</TableCell>
                            <TableCell className="text-center px-4 py-3">{ls}</TableCell>
                            <TableCell className="text-center px-4 py-3">{lf}</TableCell>
                            <TableCell className="text-center px-4 py-3">{ls - es}</TableCell>
                            <TableCell
                              className={cn("text-center px-4 py-3 font-semibold", isCritical ? "text-red-500" : "")}
                            >
                              {isCritical ? "Yes" : "No"}
                            </TableCell>
                          </TableRow>
                        )
                      };
                    })
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => item.element)
                : data.nodes.map((node) => (
                    <TableRow key={node.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="text-center px-4 py-3">{node.id + 1}</TableCell>
                      <TableCell className="text-center px-4 py-3">{node.name}</TableCell>
                      <TableCell className="text-center px-4 py-3">{node.duration}</TableCell>
                      <TableCell className="text-center px-4 py-3">{node.es}</TableCell>
                      <TableCell className="text-center px-4 py-3">{node.ef}</TableCell>
                      <TableCell className="text-center px-4 py-3">{node.ls}</TableCell>
                      <TableCell className="text-center px-4 py-3">{node.lf}</TableCell>
                      <TableCell className="text-center px-4 py-3">{node.ls - node.es}</TableCell>
                      <TableCell
                        className={cn("text-center px-4 py-3 font-semibold", node.critical ? "text-red-500" : "")}
                      >
                        {node.critical ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
