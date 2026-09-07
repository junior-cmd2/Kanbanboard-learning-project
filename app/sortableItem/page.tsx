import React from 'react'
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { Delete } from "lucide-react";


type Props = {
    id: number,
    name: string
    onDelete: (id: number) => void
}


export default function Sortable({id, name, onDelete}: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
    };

    return (
         <div ref={setNodeRef} style={style} {...attributes}  className='border p-2 rounded-2xl text-center flex justify-between'>
            <div {...listeners}>
                {name}
            </div>
            <button onClick={()=> {onDelete(id), console.log("Delete", id)}}>
                <Delete size={15}/>
            </button>
        </div>
    )
}

