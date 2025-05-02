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
}

export default function FinalTable({ data, onClose }: FinalTableProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center mb-4">
            Final CPM Table
          </DialogTitle>
        </DialogHeader>

        <div className="w-full border border-gray-400 rounded-lg overflow-hidden shadow-sm">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="bg-muted text-muted-foreground">
                <TableHead className="text-center px-4 py-3">ID</TableHead>
                <TableHead className="text-center px-4 py-3">Task Name</TableHead>
                <TableHead className="text-center px-4 py-3">Duration</TableHead>
                <TableHead className="text-center px-4 py-3">ES</TableHead>
                <TableHead className="text-center px-4 py-3">EF</TableHead>
                <TableHead className="text-center px-4 py-3">LS</TableHead>
                <TableHead className="text-center px-4 py-3">LF</TableHead>
                <TableHead className="text-center px-4 py-3">Critical Path</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.nodes.map((node) => (
                <TableRow key={node.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center px-4 py-3">{node.id + 1}</TableCell>
                  <TableCell className="text-center px-4 py-3">{node.name}</TableCell>
                  <TableCell className="text-center px-4 py-3">{node.duration}</TableCell>
                  <TableCell className="text-center px-4 py-3">{node.es}</TableCell>
                  <TableCell className="text-center px-4 py-3">{node.ef}</TableCell>
                  <TableCell className="text-center px-4 py-3">{node.ls}</TableCell>
                  <TableCell className="text-center px-4 py-3">{node.lf}</TableCell>
                  <TableCell className={cn("text-center px-4 py-3 font-semibold", node.critical ? "text-red-500" : "")}>
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
