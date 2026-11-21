/** Shape returned by Server Actions used with useActionState. */
export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
} | null;

export const actionError = (
  message: string,
  fieldErrors?: Partial<Record<string, string[]>>,
): ActionState => ({ ok: false, message, fieldErrors });

export const actionOk = (message?: string): ActionState => ({ ok: true, message });
