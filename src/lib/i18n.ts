import { DEFAULT_LOCALE, LOCALES, type Locale } from "../../site.config";

/**
 * Locale-aware UI copy.
 *
 * A typed dictionary rather than an i18n framework: there are two locales, the
 * strings are known at build time, and TypeScript already gives us the only
 * guarantee that matters — every locale defines every key, or the build fails.
 *
 * Content copy never lives here. This is chrome only.
 */

/**
 * A run of reader-facing text, optionally linked.
 *
 * An `href` starting with "http" is external; anything else is a
 * locale-relative site path that the renderer resolves with `localePath`.
 */
export type Inline = string | { text: string; href: string };

export type Prose = Inline[];

export type AboutSection = {
  heading: string;
  paragraphs: Prose[];
  /** Rendered as a list after the paragraphs, when the section has one. */
  list?: Prose[];
};

export type Dictionary = {
  /** Document-level description used when a page supplies none. */
  siteDescription: string;
  tagline: string;
  /** How this locale names itself, in itself. */
  languageName: string;
  /** Short switcher label, e.g. "EN". */
  languageShort: string;
  skipToContent: string;
  nav: {
    writing: string;
    projects: string;
    gatherings: string;
    about: string;
    home: string;
    primary: string;
  };
  languageSwitch: {
    /** aria-label for the switcher group. */
    label: string;
    /** Accessible name for the link to the other language, e.g. "View in English". */
    to: Record<Locale, string>;
    /** Announced state for the language currently being read. */
    current: string;
    /** Shown when this piece has no edition in the other language. */
    unavailable: Record<Locale, string>;
  };
  home: {
    lede: string;
    nextGathering: string;
    allWriting: string;
    allProjects: string;
  };
  writing: {
    title: string;
    lede: string;
    description: string;
    empty: string;
    readingTime: (minutes: number) => string;
    updatedOn: string;
    originallyPublished: string;
    allWriting: string;
  };
  projects: {
    title: string;
    lede: string;
    description: string;
    empty: string;
    allProjects: string;
    status: string;
    started: string;
    live: string;
    source: string;
    statusLabel: Record<"exploring" | "active" | "maintained" | "archived", string>;
  };
  gatherings: {
    title: string;
    lede: string;
    description: string;
    upcoming: string;
    past: string;
    empty: string;
    when: string;
    where: string;
    format: string;
    register: string;
    allGatherings: string;
    pastBadge: string;
    formatLabel: Record<"in-person" | "online" | "hybrid", string>;
  };
  about: {
    title: string;
    description: string;
    heading: string;
    lede: Prose[];
    sections: AboutSection[];
  };
  notFound: {
    title: string;
    lede: string;
    /** Names its own language: the 404 shows both at once. */
    home: string;
  };
  error: {
    eyebrow: string;
    title: string;
    lede: string;
    retry: string;
    reference: string;
  };
  footer: {
    nav: string;
    rss: string;
    builtInTheOpen: string;
    sourceOnGitHub: string;
  };
  topics: string;
  feed: {
    title: string;
    description: string;
  };
};

const ko: Dictionary = {
  siteDescription:
    "Convoke는 글, 프로젝트, 모임을 한국어와 영어로 함께 기록하는 개인 퍼블리케이션입니다.",
  tagline: "생각하고, 만들고, 공개적으로 모입니다.",
  languageName: "한국어",
  languageShort: "KO",
  skipToContent: "본문으로 건너뛰기",
  nav: {
    writing: "글",
    projects: "프로젝트",
    gatherings: "모임",
    about: "소개",
    home: "홈",
    primary: "주요 메뉴",
  },
  languageSwitch: {
    label: "언어",
    to: { ko: "한국어로 보기", en: "View in English" },
    current: "현재 언어",
    unavailable: {
      ko: "이 글의 한국어판은 아직 없습니다",
      en: "This piece has no English edition yet",
    },
  },
  home: {
    lede: "소프트웨어 아키텍처와 AI를 전제로 한 작업 방식에 대한 기록, 그 기록에서 나온 프로젝트, 그리고 이따금 여는 모임. 몇 년 뒤에도 읽을 가치가 남도록 씁니다.",
    nextGathering: "다음 모임",
    allWriting: "글 전체",
    allProjects: "프로젝트 전체",
  },
  writing: {
    title: "글",
    lede: "한 번에 끝나지 않는 글을 모읍니다. 최신순입니다.",
    description:
      "소프트웨어 아키텍처, 시스템 설계, AI를 전제로 한 작업 방식에 대한 글.",
    empty: "아직 공개한 글이 없습니다.",
    readingTime: (minutes) => `${minutes}분 분량`,
    updatedOn: "수정",
    originallyPublished: "이 글은 다른 곳에 먼저 실렸습니다",
    allWriting: "← 글 전체",
  },
  projects: {
    title: "프로젝트",
    lede: "진행 중인 것과 자리를 잡은 것. 지금 얼마나 살아 있는지에 따라 정렬됩니다.",
    description: "만들고 유지하는 것들 — 시스템, 도구, 실험과 그 판단 근거.",
    empty: "아직 공개한 프로젝트가 없습니다.",
    allProjects: "← 프로젝트 전체",
    status: "상태",
    started: "시작",
    live: "링크",
    source: "소스",
    statusLabel: {
      exploring: "탐색 중",
      active: "진행 중",
      maintained: "유지 보수",
      archived: "보관",
    },
  },
  gatherings: {
    title: "모임",
    lede: "의도적으로 작게 여는 자리. 신청은 외부 서비스에서 받고, 참가자 정보는 이곳에 남기지 않습니다.",
    description: "Convoke가 여는 작은 세션과 워크숍 — 예정된 것과 지난 것.",
    upcoming: "예정",
    past: "지난 모임",
    empty: "지금 예정된 모임은 없습니다. 새 모임은 이곳에 먼저 공지합니다.",
    when: "일시",
    where: "장소",
    format: "형식",
    register: "신청하기 →",
    allGatherings: "← 모임 전체",
    pastBadge: "지난 모임",
    formatLabel: {
      "in-person": "오프라인",
      online: "온라인",
      hybrid: "온·오프라인",
    },
  },
  about: {
    title: "소개",
    description: "Convoke가 무엇이고, 어떻게 쓰고 운영되며, 이 사이트가 어떻게 만들어졌는지.",
    heading: "Convoke 소개",
    lede: [
      [
        "Convoke는 한 번에 끝나지 않는 글, 그 글이 나온 프로젝트, 그리고 이따금 여는 작은 모임을 모아 두는 개인 퍼블리케이션입니다. 채용 주기에 맞춰 쓰는 포트폴리오가 아니라, 남겨 두기 위해 쓰는 기록에 가깝습니다.",
      ],
    ],
    sections: [
      {
        heading: "두 개의 언어",
        paragraphs: [
          [
            "한국어와 영어를 같은 급으로 둡니다. 영어판은 한국어판의 직역이 아니라, 영어로 읽는 사람에게 처음부터 영어로 쓰인 글처럼 읽히도록 다시 쓴 판본입니다. 다만 두 판본의 주장과 사실, 판단은 같아야 합니다. 한쪽만 먼저 공개되는 경우도 있고, 그때는 다른 언어판이 아직 없다는 사실을 숨기지 않습니다.",
          ],
        ],
      },
      {
        heading: "무엇이 있나",
        paragraphs: [],
        list: [
          [
            { text: "글", href: "/writing" },
            " — 소프트웨어 아키텍처, 시스템 설계, AI를 전제로 한 작업 방식에 대한 기록.",
          ],
          [
            { text: "프로젝트", href: "/projects" },
            " — 실제로 만든 것과, 그때의 판단과 트레이드오프.",
          ],
          [
            { text: "모임", href: "/gatherings" },
            " — 작은 세션과 워크숍. 공지는 이곳에, 신청은 외부 서비스에서 받습니다.",
          ],
        ],
      },
      {
        heading: "어떻게 운영하나",
        paragraphs: [
          [
            "방향과 판단은 사람이 정하고, 구현은 클라우드에서 도는 AI 코딩 에이전트가 GitHub를 상대로 수행합니다. 코드·설정·문서 같은 시스템 변경은 작업 브랜치와 Pull Request를 거쳐 자동 검증과 독립 검토 뒤 사람이 병합합니다. 비공개 Content OS에서 독립 검토를 마치고 사람이 명시적으로 발행을 승인한 콘텐츠만 현재 public/main을 기준으로 검증한 뒤 별도 콘텐츠 PR 없이 main에 직접 반영할 수 있습니다. 상주하는 개발용 컴퓨터는 이 과정에 없습니다. 저장소가 지속되는 상태이고, 에이전트는 일회용입니다.",
          ],
          [
            "AI는 저자가 아닙니다. 편집자이자 조사자, 번역자이며, 필요할 때는 반론을 제기하는 역할입니다. 무엇을 주장할지, 무엇이 사실인지, 어떤 경험을 말할지는 사람이 정합니다.",
          ],
          [
            "공개 소스와 비공개 작업물은 저장소 단위로 분리되어 있습니다. 초고와 조사 자료, 정리되지 않은 메모는 비공개 저장소에 있고 자동으로 공개되지 않습니다. 공개는 검토·편집·점검을 거친 명시적인 행위입니다.",
          ],
        ],
      },
      {
        heading: "만든 방식",
        paragraphs: [
          [
            "Next.js와 TypeScript로 만들고 Tailwind CSS로 스타일을 입혔으며, 글은 MDX로 씁니다. 배포는 Vercel입니다. 타이포그래피는 운영체제에 이미 있는 서체만 사용합니다. 내려받을 웹폰트가 없으니 느려질 일도, 몇 년 뒤에 깨질 일도 없습니다.",
          ],
          [
            "분석 스크립트, 추적기, 쿠키 배너, 외부 임베드가 없습니다. 이 사이트는 방문자에 대해 아무것도 수집하지 않습니다. 모임 신청은 외부 서비스로 연결하고, 참가자 정보는 이 저장소에 남기지 않습니다.",
          ],
          [
            "소스는 공개되어 있습니다: ",
            { text: "github.com/convoke-space/public", href: "https://github.com/convoke-space/public" },
            ". 글은 ",
            { text: "RSS", href: "/feed.xml" },
            "로도 받아볼 수 있습니다.",
          ],
        ],
      },
    ],
  },
  notFound: {
    title: "페이지를 찾을 수 없습니다",
    lede: "요청한 페이지가 존재하지 않거나 주소가 바뀌었을 수 있습니다.",
    home: "한국어 홈으로",
  },
  error: {
    eyebrow: "오류",
    title: "문제가 생겼습니다",
    lede: "이 페이지를 표시하지 못했습니다. 오류는 기록되었습니다.",
    retry: "다시 시도",
    reference: "참조",
  },
  footer: {
    nav: "바닥글",
    rss: "RSS",
    builtInTheOpen: "공개적으로 만듭니다 —",
    sourceOnGitHub: "GitHub 소스",
  },
  topics: "주제",
  feed: {
    title: "Convoke — 글",
    description:
      "소프트웨어 아키텍처, 시스템 설계, AI를 전제로 한 작업 방식에 대한 글.",
  },
};

const en: Dictionary = {
  siteDescription:
    "Convoke is a personal publication of writing, projects and gatherings, kept in Korean and English alike.",
  tagline: "Thinking, building, and gathering in public.",
  languageName: "English",
  languageShort: "EN",
  skipToContent: "Skip to content",
  nav: {
    writing: "Writing",
    projects: "Projects",
    gatherings: "Gatherings",
    about: "About",
    home: "Home",
    primary: "Primary",
  },
  languageSwitch: {
    label: "Language",
    to: { ko: "한국어로 보기", en: "View in English" },
    current: "Current language",
    unavailable: {
      ko: "이 글의 한국어판은 아직 없습니다",
      en: "This piece has no English edition yet",
    },
  },
  home: {
    lede: "Notes on software architecture and on working with AI as a given, the projects those notes come out of, and the occasional gathering. Written to still be worth reading in a few years.",
    nextGathering: "Next gathering",
    allWriting: "All writing",
    allProjects: "All projects",
  },
  writing: {
    title: "Writing",
    lede: "Pieces that take more than one sitting. Newest first.",
    description:
      "Essays and notes on software architecture, systems design, and working with AI as a given.",
    empty: "No published pieces yet.",
    readingTime: (minutes) => `${minutes} min read`,
    updatedOn: "updated",
    originallyPublished: "Originally published elsewhere",
    allWriting: "← All writing",
  },
  projects: {
    title: "Projects",
    lede: "Work in progress and work that has settled. Ordered by how alive each one currently is.",
    description:
      "Things built and maintained — systems, tools and experiments, with the reasoning behind them.",
    empty: "No published projects yet.",
    allProjects: "← All projects",
    status: "Status",
    started: "Started",
    live: "Live",
    source: "Source",
    statusLabel: {
      exploring: "exploring",
      active: "active",
      maintained: "maintained",
      archived: "archived",
    },
  },
  gatherings: {
    title: "Gatherings",
    lede: "Deliberately small sessions. Registration is handled off-site, and no attendee data is kept here.",
    description:
      "Small sessions and workshops hosted under Convoke — upcoming and past.",
    upcoming: "Upcoming",
    past: "Past",
    empty: "Nothing scheduled at the moment. New gatherings are announced here first.",
    when: "When",
    where: "Where",
    format: "Format",
    register: "Register →",
    allGatherings: "← All gatherings",
    pastBadge: "past",
    formatLabel: {
      "in-person": "in person",
      online: "online",
      hybrid: "hybrid",
    },
  },
  about: {
    title: "About",
    description:
      "What Convoke is, how it is written and operated, and how the site itself is built.",
    heading: "About Convoke",
    lede: [
      [
        "Convoke is a personal publication: a place for writing that takes more than one sitting, for the projects that writing comes out of, and for the occasional small gathering. It is deliberately not a portfolio. Portfolios are written for a hiring cycle; this is written for the archive.",
      ],
    ],
    sections: [
      {
        heading: "Two languages",
        paragraphs: [
          [
            "Korean and English are kept as equals. The English edition is not a literal translation of the Korean — it is rewritten so that it reads as though it had been written in English to begin with. What it may not do is diverge: the claims, the facts and the judgements have to match. One edition is sometimes published before the other, and when that happens the site says so rather than hiding it.",
          ],
        ],
      },
      {
        heading: "What lives here",
        paragraphs: [],
        list: [
          [
            { text: "Writing", href: "/writing" },
            " — on software architecture, systems design, and working with AI as a given.",
          ],
          [
            { text: "Projects", href: "/projects" },
            " — what has actually been built, with the reasoning and trade-offs left in.",
          ],
          [
            { text: "Gatherings", href: "/gatherings" },
            " — small sessions and workshops, announced here and registered for elsewhere.",
          ],
        ],
      },
      {
        heading: "How it is operated",
        paragraphs: [
          [
            "Direction and judgement are set by a person; implementation is carried out by cloud coding agents working against GitHub. System changes such as code, configuration and repository documentation go through a task branch and pull request, automated validation, independent review, and a human merge. Only content that has already passed independent review in the private Content OS and received explicit human publication approval may be validated against current public/main and committed directly to main without a separate content pull request. There is no permanent development machine in the loop — the repository is the durable state, and the agents are disposable.",
          ],
          [
            "The AI is not the author. It edits, researches, translates, and argues back when that is useful. What is claimed, what is true, and which experience gets told stay with the person writing.",
          ],
          [
            "Public source and private working material are separated at the repository level. Drafts, research and raw notes live in a private repository and never become public automatically. Publication is an explicit act: review, edit, check, publish.",
          ],
        ],
      },
      {
        heading: "Colophon",
        paragraphs: [
          [
            "Built with Next.js and TypeScript, styled with Tailwind CSS, written in MDX, and deployed on Vercel. Typography uses only faces the reader\u2019s operating system already has — no web fonts, nothing to download, nothing to break in five years.",
          ],
          [
            "There is no analytics script, no tracker, no cookie banner, and no third-party embed. Nothing here collects information about you. Event registration, when it is open, is handled by an external provider and linked to explicitly.",
          ],
          [
            "The source is public: ",
            { text: "github.com/convoke-space/public", href: "https://github.com/convoke-space/public" },
            ". Writing is available as ",
            { text: "an RSS feed", href: "/feed.xml" },
            ".",
          ],
        ],
      },
    ],
  },
  notFound: {
    title: "Page not found",
    lede: "The page may have moved, or it may never have existed.",
    home: "Go to the English home page",
  },
  error: {
    eyebrow: "Error",
    title: "Something went wrong",
    lede: "This page failed to render. The problem has been logged.",
    retry: "Try again",
    reference: "Reference",
  },
  footer: {
    nav: "Footer",
    rss: "RSS",
    builtInTheOpen: "Built in the open —",
    sourceOnGitHub: "source on GitHub",
  },
  topics: "Topics",
  feed: {
    title: "Convoke — Writing",
    description:
      "Essays and notes on software architecture, systems design, and working with AI as a given.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { ko, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Narrowing guard for an untrusted route segment. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** The locales other than the given one. With two locales this is one entry. */
export function otherLocales(locale: Locale): Locale[] {
  return LOCALES.filter((l) => l !== locale);
}

export { LOCALES, DEFAULT_LOCALE };
export type { Locale };
