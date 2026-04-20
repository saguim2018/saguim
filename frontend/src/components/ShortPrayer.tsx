import SectionHeader from "./SectionHeader";

interface Props {
  step: number;
  title: string;
  guidance: string;
}

export default function ShortPrayer({ step, title, guidance }: Props) {
  return (
    <section
      className="py-6 px-5"
      style={{ borderBottom: "0.5px solid var(--divider)" }}
    >
      <SectionHeader step={step} title={title} />
      <p
        className="font-serif text-[14.5px] leading-[1.85]"
        style={{ color: "var(--text-secondary)" }}
      >
        {guidance}
      </p>
    </section>
  );
}
