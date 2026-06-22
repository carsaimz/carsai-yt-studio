/**
 * notifications.ts
 * Centralized notification utilities for Carsai YT Studio.
 * Uses React Toastify for quick toasts and SweetAlert2 for confirmations/dialogs.
 */

import { toast as _toast } from "react-toastify";
import Swal from "sweetalert2";

// ─── Toast shortcuts ────────────────────────────────────────────────────────

export const toast = {
  success: (msg: string) => _toast.success(msg),
  error: (msg: string) => _toast.error(msg),
  info: (msg: string) => _toast.info(msg),
  warning: (msg: string) => _toast.warning(msg),
  loading: (msg: string) => _toast.loading(msg),
  dismiss: (id?: string | number) => _toast.dismiss(id),
  promise: _toast.promise,
};

// ─── SweetAlert2 themed instance ─────────────────────────────────────────────

const SwalStyled = Swal.mixin({
  customClass: {
    popup: "swal-carsai",
    confirmButton: "swal-btn-confirm",
    cancelButton: "swal-btn-cancel",
    denyButton: "swal-btn-deny",
  },
  buttonsStyling: false,
  background: "oklch(0.225 0.014 60)",
  color: "oklch(0.97 0.005 80)",
});

// ─── Confirm dialog ──────────────────────────────────────────────────────────

export async function confirm(options: {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "question" | "info" | "error" | "success";
}): Promise<boolean> {
  const result = await SwalStyled.fire({
    title: options.title,
    text: options.text,
    icon: options.icon ?? "question",
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "Confirmar",
    cancelButtonText: options.cancelText ?? "Cancelar",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

// ─── Alert dialog ─────────────────────────────────────────────────────────────

export async function alert(options: {
  title: string;
  text?: string;
  icon?: "warning" | "question" | "info" | "error" | "success";
  confirmText?: string;
}): Promise<void> {
  await SwalStyled.fire({
    title: options.title,
    text: options.text,
    icon: options.icon ?? "info",
    confirmButtonText: options.confirmText ?? "OK",
  });
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

export async function confirmDelete(what: string): Promise<boolean> {
  return confirm({
    title: `Excluir ${what}?`,
    text: "Esta ação não pode ser desfeita.",
    icon: "warning",
    confirmText: "Sim, excluir",
    cancelText: "Cancelar",
  });
}

// ─── Input prompt ─────────────────────────────────────────────────────────────

export async function prompt(options: {
  title: string;
  label?: string;
  placeholder?: string;
  inputType?: "text" | "email" | "url" | "textarea";
  initialValue?: string;
}): Promise<string | null> {
  const result = await SwalStyled.fire({
    title: options.title,
    input: options.inputType ?? "text",
    inputLabel: options.label,
    inputPlaceholder: options.placeholder,
    inputValue: options.initialValue ?? "",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Cancelar",
  });
  return result.isConfirmed ? (result.value as string) : null;
}

export { Swal as swal };
