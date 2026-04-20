interface Props {
  step: number;
  title: string;
}

export default function SectionHeader({ step, title }: Props) {
  return (
    <div className="flex items-baseline gap-2 mb-3">
      <span
        className="font-ui text-[11px] font-medium tracking-widest"
        style={{ color: "var(--text-tertiary)" }}
      >
        {String(step).padStart(2, "0")}
      </span>
      <h2
        className="font-ui text-base font-medium"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h2>
    </div>
  );
}
