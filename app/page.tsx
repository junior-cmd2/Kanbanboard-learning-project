'use client'
import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableAttributes } from "@dnd-kit/core";
import Sortable from "./sortableItem/page";
import {useKabanStore} from '../store/kanbanStore'

type Item = {
  id: number;
  name: string;
};
type Column = {
  id: string;
  items: Item[];
};

export default function kanBandDashBoard() {

  const list: Column[] = [
    {
      id: "TO DO",
      items: [
        { id: 1, name: "Task A" },
        { id: 2, name: "Task B" },
        { id: 3, name: "Task C" },
        { id: 4, name: "Task D" },
        { id: 5, name: "Task E" },
      ]

    },
    {
      id: "Doing",
      items: [
        { id: 6, name: "Task F" },
        { id: 7, name: "Task G" },
        { id: 8, name: "Task H" },
      ]
    },
    {
      id: "DONE",
      items: [
        { id: 9, name: "Task I" }
      ]
    }
  ]

  const items = useKabanStore((state)=> state.items)
  const setItem = useKabanStore((state)=> state.setItems)
  const [isMounted, setIsMounted] = useState(false);
  const [taskName, setTaskName] = useState("")
  const [selectedcolumnId, setCloumnId] = useState("TO DO")

  // This runs only on the client side after the initial HTML is rendered
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If we are still on the server (or initial client render), return null or a skeleton
  if (!isMounted) {
    return <div className="flex flex-col space-y-3">Loading board...</div>;
  }

  const handleDragEnd = (event: any) => {
    if (event.canceled) return
    const { active, over } = event
    console.log("Item dragged", active)
    console.log("item dragged over", over)

    if (over && active.id !== over.id) {
      setItem((currentItems) => {
        const columnSearch = currentItems.find((column) => column.items.some((item) => item.id === active.id));
        if (!columnSearch) { return currentItems; }
        const oldIndex = columnSearch.items.findIndex((item) => item.id === active.id)
        const newIndex = columnSearch.items.findIndex((item) => item.id === over.id)

        console.log("old index", oldIndex)
        console.log("new index", newIndex)

        if (oldIndex === -1 || newIndex === -1) { return currentItems; }
        const newItems = [...currentItems]
        const columnIndex = newItems.findIndex((column) => column.id === columnSearch.id);
        if (columnIndex === -1) { return currentItems; }
        const newColumn = { ...newItems[columnIndex], items: [...newItems[columnIndex].items] }
        console.log("this is a new object of the new array created", newColumn)

        const [removedItem] = newColumn.items.splice(oldIndex, 1);
        newColumn.items.splice(newIndex, 0, removedItem);
        newItems[columnIndex] = newColumn;
        return newItems;
      })
    }
  }

  const handleDragOver = (event: any) => {
    const { over, active } = event

    if (!over) return

    setItem((currentItems) => {
      const sourceColumn = currentItems.find((column) => column.items.some((item) => item.id === active.id))
      const targetColumn = currentItems.find((column) => column.items.some((item) => item.id === over.id))

      console.log("source column", sourceColumn)
      console.log("target column", targetColumn)

      if (!sourceColumn || !targetColumn) return currentItems

      if (sourceColumn.id === targetColumn.id) return currentItems

      const sourceItems = sourceColumn.items.findIndex((item) => item.id === active.id)
      const targetItems = targetColumn.items.findIndex((item) => item.id === over.id)
      if (sourceItems === -1 || targetItems === -1) {
        return currentItems;
      }

      const newItems = [...currentItems];
      const newSourceColumn = { ...sourceColumn, items: [...sourceColumn.items] };
      const newTargetColumn = { ...targetColumn, items: [...targetColumn.items] };
      const [removedItem] = newSourceColumn.items.splice(sourceItems, 1)
      newTargetColumn.items.splice(targetItems, 0, removedItem)

      const sourceColumnIndex = newItems.findIndex((column) => column.id === sourceColumn.id);
      const targetColumnIndex = newItems.findIndex((column) => column.id === targetColumn.id);

      newItems[sourceColumnIndex] = newSourceColumn;
      newItems[targetColumnIndex] = newTargetColumn;

      return newItems
    })
  }

  const handleInputChange = (e: any) => {
    e.preventDefault()
    setTaskName(e.target.value)
  }

  const addTask = (e: any) => {
    e.preventDefault()
    setItem((currentItems) => {
      return currentItems.map((column) => {
        if (column.id === selectedcolumnId) {
          return {
            ...column,
            items: [
              ...column.items,
              {
                id: Date.now(),
                name: taskName
              }
            ]
          }
        }
        return column
      })
    })
  }

  const deleteTask=(taskId:number)=>{
    setItem((currentItems)=> {
      return currentItems.map((column)=>{
        return{
          ...column,
          items: column.items.filter((items)=> items.id !== taskId)
        }
      })
    })
  }

  return (
    <div className="md:flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="mb-10 flex justify-center text-center">
        <h1 className="font-bold text-4xl bg-linear-to-r from-orange-400 to-orange-800 bg-clip-text text-transparent">Kanban board</h1>
      </div>
      <div className="mb-10 flex justify-center items-center">
        <form action="" onSubmit={addTask} className="flex">
          <div className="flex">
            <input type="text" placeholder="What's on your mind ?" className="border p-2" onChange={handleInputChange} value={taskName} />
            <select name="" id="form" className="border" value={selectedcolumnId} onChange={(e) => setCloumnId(e.target.value)}>
              <option value="TO DO">TO DO</option>
              <option value="Doing">DOING</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
          <button className="bg-red-400 border-white pr-3 pl-3 rounded-4xl cursor-pointer">ADD TASK</button>
        </form>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-20">
        <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
          {items.map((column) => {
            // console.log("current column Id:", column?.id)
            return (
              <div key={column.id} className="border p-5 w-60">
                {/* Column name */}
                <h2 className="text-xl font-bold mb-4 text-center text-red-500">
                  {column?.id}
                </h2>
                {/* Tasks belonging to this column */}
                <SortableContext strategy={verticalListSortingStrategy} items={column.items.map((item) => item.id)}>
                  {column.items.map((item) => {
                    // console.log("Current Items:", item.id, item.name)
                    return (
                      <div className="flex flex-col p-3" key={item.id}>
                        <Sortable id={item.id} name={item.name} onDelete={deleteTask}/>
                      </div>
                    )
                  })}
                </SortableContext>
              </div>
            )
          })}
        </DndContext>
      </div>
    </div>
  );
}  