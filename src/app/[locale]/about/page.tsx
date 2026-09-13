import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, siteConfig, type Locale } from "../../../../site.config";
import { Container } from "@/components/container";
import { PageShell } from "@/components/page-shell";
import { languageTargets, sharedPage } from "@/lib/alternates";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { localePath } from "@/lib/site";

type Params = { locale: string };

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    path: "/about",
    title: dict.about.title,
    description: dict.about.description,
    alternates: sharedPage("/about"),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(sharedPage("/about"))}
      activePath="/about"
    >
      <Container width="prose">
        <header className="pt-12 pb-8 sm:pt-16">
          <p className="eyebrow mb-3">{dict.about.title}</p>
          <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
            {locale === "ko" ? `${siteConfig.name} 소개` : `About ${siteConfig.name}`}
          </h1>
        </header>

        <div className="prose">
          {locale === "ko" ? <AboutKo /> : <AboutEn />}
        </div>

        <div className="pb-16" />
      </Container>
    </PageShell>
  );
}

function AboutKo() {
  return (
    <>
      <p>
        Convoke는 한 번에 끝나지 않는 글, 그 글이 나온 프로젝트, 그리고 이따금
        여는 작은 모임을 모아 두는 개인 퍼블리케이션입니다. 채용 주기에 맞춰
        쓰는 포트폴리오가 아니라, 남겨 두기 위해 쓰는 기록에 가깝습니다.
      </p>

      <h2>두 개의 언어</h2>
      <p>
        한국어와 영어를 같은 급으로 둡니다. 영어판은 한국어판의 직역이 아니라,
        영어로 읽는 사람에게 처음부터 영어로 쓰인 글처럼 읽히도록 다시 쓴
        판본입니다. 다만 두 판본의 주장과 사실, 판단은 같아야 합니다. 한쪽만
        먼저 공개되는 경우도 있고, 그때는 다른 언어판이 아직 없다는 사실을
        숨기지 않습니다.
      </p>

      <h2>무엇이 있나</h2>
      <ul>
        <li>
          <Link href={localePath("ko", "/writing")}>글</Link> — 소프트웨어
          아키텍처, 시스템 설계, AI를 전제로 한 작업 방식에 대한 기록.
        </li>
        <li>
          <Link href={localePath("ko", "/projects")}>프로젝트</Link> — 실제로
          만든 것과, 그때의 판단과 트레이드오프.
        </li>
        <li>
          <Link href={localePath("ko", "/gatherings")}>모임</Link> — 작은 세션과
          워크숍. 공지는 이곳에, 신청은 외부 서비스에서 받습니다.
        </li>
      </ul>

      <h2>어떻게 운영하나</h2>
      <p>
        방향과 판단은 사람이 정하고, 구현은 클라우드에서 도는 AI 코딩
        에이전트가 GitHub를 상대로 수행합니다. 모든 변경은 Pull Request로
        올라오고, 자동 검증을 통과한 뒤 사람이 읽고 병합합니다. 상주하는 개발용
        컴퓨터는 이 과정에 없습니다. 저장소가 지속되는 상태이고, 에이전트는
        일회용입니다.
      </p>
      <p>
        AI는 저자가 아닙니다. 편집자이자 조사자, 번역자이며, 필요할 때는 반론을
        제기하는 역할입니다. 무엇을 주장할지, 무엇이 사실인지, 어떤 경험을
        말할지는 사람이 정합니다.
      </p>
      <p>
        공개 소스와 비공개 작업물은 저장소 단위로 분리되어 있습니다. 초고와
        조사 자료, 정리되지 않은 메모는 비공개 저장소에 있고 자동으로 공개되지
        않습니다. 공개는 검토·편집·점검을 거친 명시적인 행위입니다.
      </p>

      <h2>만든 방식</h2>
      <p>
        Next.js와 TypeScript로 만들고 Tailwind CSS로 스타일을 입혔으며, 글은
        MDX로 씁니다. 배포는 Vercel입니다. 타이포그래피는 운영체제에 이미 있는
        서체만 사용합니다. 내려받을 웹폰트가 없으니 느려질 일도, 몇 년 뒤에
        깨질 일도 없습니다.
      </p>
      <p>
        분석 스크립트, 추적기, 쿠키 배너, 외부 임베드가 없습니다. 이 사이트는
        방문자에 대해 아무것도 수집하지 않습니다. 모임 신청은 외부 서비스로
        연결하고, 참가자 정보는 이 저장소에 남기지 않습니다.
      </p>
      <p>
        소스는 공개되어 있습니다:{" "}
        <a href={siteConfig.repositoryUrl} rel="noreferrer">
          github.com/convoke-space/public
        </a>
        . 글은 <a href={localePath("ko", "/feed.xml")}>RSS</a>로도 받아볼 수
        있습니다.
      </p>
    </>
  );
}

function AboutEn() {
  return (
    <>
      <p>
        Convoke is a personal publication: a place for writing that takes more
        than one sitting, for the projects that writing comes out of, and for
        the occasional small gathering. It is deliberately not a portfolio.
        Portfolios are written for a hiring cycle; this is written for the
        archive.
      </p>

      <h2>Two languages</h2>
      <p>
        Korean and English are kept as equals. The English edition is not a
        literal translation of the Korean — it is rewritten so that it reads as
        though it had been written in English to begin with. What it may not do
        is diverge: the claims, the facts and the judgements have to match. One
        edition is sometimes published before the other, and when that happens
        the site says so rather than hiding it.
      </p>

      <h2>What lives here</h2>
      <ul>
        <li>
          <Link href={localePath("en", "/writing")}>Writing</Link> — on software
          architecture, systems design, and working with AI as a given.
        </li>
        <li>
          <Link href={localePath("en", "/projects")}>Projects</Link> — what has
          actually been built, with the reasoning and trade-offs left in.
        </li>
        <li>
          <Link href={localePath("en", "/gatherings")}>Gatherings</Link> — small
          sessions and workshops, announced here and registered for elsewhere.
        </li>
      </ul>

      <h2>How it is operated</h2>
      <p>
        Direction and judgement are set by a person; implementation is carried
        out by cloud coding agents working against GitHub. Every change arrives
        as a pull request, passes automated validation, and is merged only after
        a human reads it. There is no permanent development machine in the loop —
        the repository is the durable state, and the agents are disposable.
      </p>
      <p>
        The AI is not the author. It edits, researches, translates, and argues
        back when that is useful. What is claimed, what is true, and which
        experience gets told stay with the person writing.
      </p>
      <p>
        Public source and private working material are separated at the
        repository level. Drafts, research and raw notes live in a private
        repository and never become public automatically. Publication is an
        explicit act: review, edit, check, publish.
      </p>

      <h2>Colophon</h2>
      <p>
        Built with Next.js and TypeScript, styled with Tailwind CSS, written in
        MDX, and deployed on Vercel. Typography uses only faces the reader&rsquo;s
        operating system already has — no web fonts, nothing to download,
        nothing to break in five years.
      </p>
      <p>
        There is no analytics script, no tracker, no cookie banner, and no
        third-party embed. Nothing here collects information about you. Event
        registration, when it is open, is handled by an external provider and
        linked to explicitly.
      </p>
      <p>
        The source is public:{" "}
        <a href={siteConfig.repositoryUrl} rel="noreferrer">
          github.com/convoke-space/public
        </a>
        . Writing is available as{" "}
        <a href={localePath("en", "/feed.xml")}>an RSS feed</a>.
      </p>
    </>
  );
}
