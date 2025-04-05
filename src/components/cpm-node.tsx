import { Handle, Position, NodeProps } from 'reactflow';
import { CPM_Node } from '@/lib/Graph'; 

// obliczamy rezerwe
type CpmNodeData = CPM_Node & {
    R: number;
};

const CpmNode = ({ data, selected }: NodeProps<CpmNodeData>) => {
    const cellClasses = 'border border-neutral-600 px-1.5 py-1 min-w-[50px] box-border';
    const nodeClasses = `
        w-[180px] rounded-md text-xs text-center text-white bg-neutral-800
        border-2 ${data.critical ? 'border-red-500' : 'border-neutral-500'}
        ${selected ? 'shadow-lg shadow-blue-500/50' : ''} // Dodatkowe podświetlenie przy zaznaczeniu
    `;

    return (
        <div className={nodeClasses}>
            {/* Handle wejściowy (target) - krawędzie będą wchodzić od góry */}
            <Handle
                type="target"
                position={Position.Top}
                id="t" 
                className="!w-2 !h-2 !bg-teal-500" 
            />

            {/* Górny wiersz: ES, T, EF */}
            <div className="flex justify-between">
                <div className={cellClasses}>{data.es}</div>
                <div className={`${cellClasses} font-bold`}>{data.duration}</div> {/* T */}
                <div className={cellClasses}>{data.ef}</div>
            </div>

            {/* Środkowy wiersz: Nazwa */}
            <div className="flex justify-between border-t border-b border-neutral-600">
                <div className={`${cellClasses} flex-grow border-l-0 border-r-0 font-bold text-sm`}>
                    {data.name}
                </div>
            </div>

            {/* Dolny wiersz: LS, R, LF */}
            <div className="flex justify-between">
                <div className={cellClasses}>{data.ls}</div>
                <div className={cellClasses}>{data.R}</div> {/* R (rezerwa) */}
                <div className={cellClasses}>{data.lf}</div>
            </div>

            {/* Handle wyjściowy (source) - krawędzie będą wychodzić od dołu */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="b" 
                className="!w-2 !h-2 !bg-rose-500" 
            />
        </div>
    );
};
export default CpmNode;