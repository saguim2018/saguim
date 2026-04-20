import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { fetchDaily } from "@/lib/fetchDaily";
import { todayKST } from "@/lib/dateUtils";

export const dynamicParams = false;

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "public", "data", "daily");
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map((f) => ({ date: f.replace(".json", "") }));
  } catch {
    return [];
  }
}
import TopBar from "@/components/TopBar";
import ShortPrayer from "@/components/ShortPrayer";
import PraiseCard from "@/components/PraiseCard";
import BibleSlidingSheet from "@/components/BibleSlidingSheet";
import CollapsibleCommentary from "@/components/CollapsibleCommentary";
import CovenantPrayer from "@/components/CovenantPrayer";

interface Props {
  params: Promise<{ date: string }>;
}

export default async function WorshipPage({ params }: Props) {
  const { date } = await params;
  const data = await fetchDaily(date);
  const today = todayKST();

  if (!data) {
    notFound();
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopBar date={date} todayDate={today} />

      <main className="max-w-2xl mx-auto">
        <ShortPrayer
          step={1}
          title="관상기도"
          guidance="고요히 눈을 감고 마음을 정리하세요. 하나님의 임재 앞에 서는 시간입니다. 잠시 호흡을 고르며 이 예배의 시간을 하나님께 드립니다."
        />

        <ShortPrayer
          step={2}
          title="회개 기도"
          guidance="마음속에 떠오르는 죄와 허물을 솔직하게 고백하세요. 하나님은 우리를 아시고 긍휼히 여기십니다."
        />

        <ShortPrayer
          step={3}
          title="감사 기도"
          guidance="오늘 하루, 이 한 주간, 하나님의 손길이 닿은 곳들을 생각해 보세요. 작은 것부터 감사를 드립니다."
        />

        <PraiseCard
          step={4}
          label="감사 찬양"
          song={data.praise_thanks}
          guidance="하나님의 은혜를 기억하며 감사의 찬양을 드립니다."
        />

        <BibleSlidingSheet bible={data.bible} />

        <CollapsibleCommentary wesley={data.wesley} passageRef={data.passage.ref} />

        <ShortPrayer
          step={7}
          title="마음에 새기는 기도"
          guidance={`오늘 읽은 ${data.passage.ref} 말씀 한 절을 마음에 담고, 그 말씀이 오늘 하루 삶 속에 살아 역사하도록 기도합니다.`}
        />

        <PraiseCard
          step={8}
          label="결단 찬양"
          song={data.praise_response}
          guidance="오늘의 말씀에 응답하며 결단과 헌신의 찬양을 드립니다."
        />

        <ShortPrayer
          step={9}
          title="중보 기도"
          guidance="가족, 이웃, 교회, 그리고 세상을 위해 기도합니다. 주님의 나라와 뜻이 이 땅에 임하도록 구합니다."
        />

        <CovenantPrayer />
      </main>
    </div>
  );
}
