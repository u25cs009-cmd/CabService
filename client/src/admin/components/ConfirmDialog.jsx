import React from 'react';
import Modal from './Modal';
import Button from '../../components/common/Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${isDanger ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={isDanger ? 'bg-rose-600 hover:bg-rose-700 text-white font-bold' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
