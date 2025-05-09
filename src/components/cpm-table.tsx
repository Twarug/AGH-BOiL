"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { CPM_Data } from "@/lib/Graph";
import { useEffect } from "react";

// Dynamiczny schema w zależności od trybu (AOA/AON)
const createSchema = (isAOA: boolean) => 
  z.object({
    data: z.array(
      z.object({
        name: z.string().min(1, "Required"),
        duration: z.number().min(1, "Must be positive"),
        ...(isAOA ? { 
          successions: z.string()
            .min(1, "Required")
            .regex(/^\d+-\d+$/, { message: "Format must be <digit>-<digit> (e.g., '1-2')" }),
          dependencies: z.string().default("")
        } : { 
          dependencies: z.string().optional().default(""),
          successions: z.string().default(""),
        })
      })
    )
  }).superRefine((val, ctx) => {
    const nameMap = new Map<string, number>();
    val.data.forEach((item, index) => {
      if (item.name && nameMap.has(item.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Task names must be unique",
          path: ["data", index, "name"] 
        });
      }
      nameMap.set(item.name, index);
    });
  });

type CPM_Table_Data = {
  name: string;
  duration: number;
  dependencies: string;
  successions: string;
};

type CPMDataProps = {
  isAOA: boolean;
  onCreateCPM?: (data: CPM_Data[]) => void;
};

export default function CPMTable({ isAOA, onCreateCPM }: CPMDataProps) {

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createSchema(isAOA)),
    defaultValues: { 
      data: [{ 
        name: "", 
        duration: 1, 
        dependencies: "", 
        successions: "" 
      }] 
    },
  });

  useEffect(() => {
    reset({
      data: [{ 
        name: "", 
        duration: 1, 
        dependencies: "", 
        successions: "" 
      }]
    });
  }, [isAOA, reset]);

  const { fields, append, remove } = useFieldArray({ 
    control, 
    name: "data" 
  });

  const parseToProperData = (data: CPM_Table_Data[]) => {
    return data.map((item, _, array) => {
      if(isAOA){
        const [start, end] = item.successions.split("-").map(Number);
        return {
          name: item.name,
          duration: item.duration,
          dependencies: [start],
          successors: [end],
        };
      } else {
        const dependencyNames = item.dependencies
          ? item.dependencies.split(",").map(name => name.trim())
          : [];
    
        const dependencyIds = dependencyNames
          .map(name => array.findIndex(el => el.name === name))
          .filter(id => id !== -1);
    
        return {
          name: item.name,
          duration: item.duration,
          dependencies: dependencyIds,
          successors: [],
        };
      }
    });
  }


  const onSubmit = (values: { data: CPM_Table_Data[] }) => {
    console.log('Validation errors:', errors)
    const cpmData : CPM_Data[] = parseToProperData(values.data);

    if (onCreateCPM) {
      onCreateCPM(cpmData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex justify-center flex-col items-center">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead className="w-28 text-center">Name</TableHead>
            <TableHead className="w-20 text-center">Duration</TableHead>
            <TableHead className="w-40 text-center">
              {isAOA ? "Successions (e.g., 1-2)" : "Dependencies (e.g., A,B)"}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Input 
                  {...register(`data.${index}.name`)} 
                  placeholder="Task Name"
                  className={errors.data?.[index]?.name ? "border-destructive" : ""}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  {...register(`data.${index}.duration`, { valueAsNumber: true })}
                  placeholder="Duration"
                  className={errors.data?.[index]?.duration ? "border-destructive" : ""}
                />
              </TableCell>
              <TableCell>
                {isAOA ? (
                  <Input
                    {...register(`data.${index}.successions`)}
                    placeholder="e.g., 1-2"
                    className={errors.data?.[index]?.successions ? "border-destructive" : ""}
                  />
                ) : (
                  <Input
                    {...register(`data.${index}.dependencies`)}
                    placeholder="e.g., A,B"          
                    className={errors.data?.[index]?.dependencies ? "border-destructive" : ""}          
                  />
                )}
              </TableCell>
              <TableCell>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => remove(index)}
                  tabIndex={-1}
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          {
            errors.data && 
            (Array.isArray(errors.data) && 
            errors.data.some((item) => item?.name?.message === "Task names must be unique") && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500 text-sm">
                  Task names must be unique
                </TableCell>
              </TableRow>
            )
          )}
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => append({ 
                  name: "", 
                  duration: 1, 
                  dependencies: "", 
                  successions: "" 
                })}
              >
                <Plus size={16} /> Add Task
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Button type="submit">Calculate CPM</Button>
      
    </form>
  );
}