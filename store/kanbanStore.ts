import { create } from "zustand";
import { persist } from 'zustand/middleware';

type items = {
    id: number;
    name: string
}

type columns = {
    id: string;
    items: items[]
}

const list: columns[] =[   
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

type kabanaStore = {
    items: columns[]
    setItems: (updater: columns[] | ((currentItems: columns[])=> columns[])) => void
}


export const useKabanStore = create<kabanaStore>()(
    persist((set)=> ({
        items: list,
        setItems: (updater) => 
            set((state) => ({
                items: typeof updater === "function" ? updater(state.items) : updater
            }))
    }), {
        name: "kanban board"
    })
)