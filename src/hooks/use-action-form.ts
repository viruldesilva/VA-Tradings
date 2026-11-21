"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { ActionState } from "@/lib/action-state";

/**
 * useActionState wired to a form's onSubmit instead of its `action` prop,
 * so React does NOT reset the inputs after the action returns (validation
 * errors, "not found" results, searches the user wants to tweak, ...).
 */
export function useActionForm<S = ActionState>(
  action: (prev: S, formData: FormData) => Promise<S>,
  initialState: S = null as S,
) {
  // React types the state as Awaited<S>; our states are plain objects, so it's the same type.
  const [state, formAction, pending] = useActionState<S, FormData>(
    action as (prev: Awaited<S>, formData: FormData) => Promise<S>,
    initialState as Awaited<S>,
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return { state, pending, onSubmit };
}
