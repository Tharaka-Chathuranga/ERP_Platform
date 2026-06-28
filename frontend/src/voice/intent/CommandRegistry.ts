import type { CommandDef } from "./types";

/**
 * Holds the set of commands currently available. Global commands live here for
 * the whole session; pages add/remove contextual commands on mount/unmount.
 *
 * Single responsibility: membership + change notification. Matching, grammar and
 * dispatch live elsewhere.
 */
export class CommandRegistry {
  private readonly commands = new Map<string, CommandDef>();
  private readonly listeners = new Set<() => void>();

  register(commands: readonly CommandDef[]): void {
    for (const command of commands) this.commands.set(command.id, command);
    this.notify();
  }

  unregister(commandIds: readonly string[]): void {
    let changed = false;
    for (const id of commandIds) changed = this.commands.delete(id) || changed;
    if (changed) this.notify();
  }

  get(commandId: string): CommandDef | undefined {
    return this.commands.get(commandId);
  }

  list(): CommandDef[] {
    return [...this.commands.values()];
  }

  /** Subscribe to membership changes; returns an unsubscribe handle. */
  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
