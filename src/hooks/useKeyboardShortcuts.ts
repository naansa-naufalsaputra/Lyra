import { useEffect } from 'react';
import { useTaskModal } from '../context/TaskModalContext';

export function useKeyboardShortcuts() {
  const { openModal, closeModal, isOpen } = useTaskModal();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open task modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeModal();
        } else {
          openModal();
        }
      }

      // Esc to close modal (though usually handled by Framer Motion or the modal itself, 
      // explicitly adding it for robustness if needed)
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal, closeModal, isOpen]);
}
