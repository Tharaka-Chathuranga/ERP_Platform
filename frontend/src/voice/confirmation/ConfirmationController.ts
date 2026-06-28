/**
 * State machine for the safe execution of a mutating voice command:
 *
 *   begin() → PENDING → confirm() → EXECUTE → settled
 *                    ↘ cancel() / timeout → settled (aborted)
 *
 * Guarantees: nothing runs until confirm(); a single execution lock prevents
 * double-firing; an inactivity timeout aborts a forgotten prompt. UI and the
 * engine grammar react to `onChange`.
 *
 * Single responsibility: orchestrate the confirm lifecycle. It knows nothing
 * about speech or React.
 */

export interface PendingConfirmation {
  /** Human read-back of what will happen, e.g. "Issue 42 litres to TRUCK-1". */
  readonly description: string;
}

export type ConfirmationOutcome = "confirmed" | "cancelled" | "timeout" | "error";

interface ActiveConfirmation {
  readonly description: string;
  readonly execute: () => Promise<void>;
  readonly onSettled?: (outcome: ConfirmationOutcome, error?: unknown) => void;
}

const DEFAULT_TIMEOUT_MS = 8000;

export class ConfirmationController {
  private active: ActiveConfirmation | null = null;
  private running = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS) {}

  get isPending(): boolean {
    return this.active !== null;
  }

  getPending(): PendingConfirmation | null {
    return this.active ? { description: this.active.description } : null;
  }

  /** Arms a confirmation. Any previously pending one is cancelled first. */
  begin(confirmation: ActiveConfirmation): void {
    if (this.active) this.cancel();
    this.active = confirmation;
    this.armTimeout();
    this.notify();
  }

  /** Executes the armed action exactly once. */
  async confirm(): Promise<void> {
    const active = this.active;
    if (!active || this.running) return;
    this.running = true;
    this.clearTimeout();
    try {
      await active.execute();
      this.settle(active, "confirmed");
    } catch (error) {
      this.settle(active, "error", error);
    } finally {
      this.running = false;
    }
  }

  cancel(): void {
    const active = this.active;
    if (!active) return;
    this.settle(active, "cancelled");
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    this.clearTimeout();
    this.active = null;
    this.listeners.clear();
  }

  private settle(active: ActiveConfirmation, outcome: ConfirmationOutcome, error?: unknown): void {
    this.clearTimeout();
    this.active = null;
    this.notify();
    active.onSettled?.(outcome, error);
  }

  private armTimeout(): void {
    this.clearTimeout();
    this.timer = setTimeout(() => {
      const active = this.active;
      if (active) this.settle(active, "timeout");
    }, this.timeoutMs);
  }

  private clearTimeout(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
