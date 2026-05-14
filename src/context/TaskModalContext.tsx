/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { Task } from '../components/TaskCard';

interface TaskModalContextType {
  isOpen: boolean;
  editingTask: Task | null;
  detailTask: Task | null;
  openModal: (task?: Task) => void;
  closeModal: () => void;
  openDetail: (task: Task) => void;
  closeDetail: () => void;
}

const TaskModalContext = createContext<TaskModalContextType | undefined>(undefined);

export const TaskModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
    } else {
      setEditingTask(null);
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setEditingTask(null), 300);
  };

  const openDetail = (task: Task) => {
    setDetailTask(task);
  };

  const closeDetail = () => {
    setDetailTask(null);
  };

  return (
    <TaskModalContext.Provider value={{ 
      isOpen, 
      editingTask, 
      detailTask, 
      openModal, 
      closeModal, 
      openDetail, 
      closeDetail 
    }}>
      {children}
    </TaskModalContext.Provider>
  );
};

export const useTaskModal = () => {
  const context = useContext(TaskModalContext);
  if (context === undefined) {
    throw new Error('useTaskModal must be used within a TaskModalProvider');
  }
  return context;
};
