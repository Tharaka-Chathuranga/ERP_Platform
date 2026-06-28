import {
  IconAlertTriangle,
  IconMessageChatbot,
  IconMicrophone,
  IconSparkles,
} from "@tabler/icons-react";
import type { AssistantPhase } from "../react/VoiceContext";
import "./voiceAssistant.css";

/**
 * The animated assistant orb. Its colour, icon and motion communicate the
 * current phase: idle (breathing), listening (pulse rings), processing
 * (spinner), speaking (equaliser), error (static red). A sparkle accent sits
 * just outside the circle to signal the AI assistant.
 *
 * Presentational only — all behaviour is passed in via props.
 */
export function AssistantOrb({
  phase,
  onClick,
  label,
}: {
  phase: AssistantPhase;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`voiceOrb voiceOrb--${phase}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {phase === "listening" ? (
        <>
          <span className="voiceRing" />
          <span className="voiceRing voiceRing--2" />
          <span className="voiceRing voiceRing--3" />
        </>
      ) : null}

      {phase === "processing" || phase === "loading" ? <span className="voiceSpinner" /> : null}

      <PhaseIcon phase={phase} />

      {phase !== "error" ? (
        <IconSparkles className="voiceSparkle" size={20} aria-hidden />
      ) : null}
    </button>
  );
}

function PhaseIcon({ phase }: { phase: AssistantPhase }) {
  switch (phase) {
    case "listening":
      return <IconMicrophone size={26} />;
    case "speaking":
      return (
        <span className="voiceBars" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </span>
      );
    case "error":
      return <IconAlertTriangle size={26} />;
    case "processing":
    case "loading":
      return <IconMessageChatbot size={24} />;
    default:
      return <IconMessageChatbot size={26} />;
  }
}
