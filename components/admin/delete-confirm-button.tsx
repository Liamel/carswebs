"use client";

type DeleteConfirmButtonProps = {
  formId: string;
  message?: string;
};

export function DeleteConfirmButton({
  formId,
  message = "Delete this item? This action cannot be undone.",
}: DeleteConfirmButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center justify-center rounded-full border border-rose-300 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
      onClick={() => {
        const form = document.getElementById(formId) as HTMLFormElement | null;

        if (!form) {
          return;
        }

        if (window.confirm(message)) {
          form.requestSubmit();
        }
      }}
    >
      Delete
    </button>
  );
}
