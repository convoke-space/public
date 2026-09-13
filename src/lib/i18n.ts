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
  };
  notFound: {
    eyebrow: string;
    title: string;
    lede: string;
    body: string;
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
  },
  notFound: {
    eyebrow: "404",
    title: "이 페이지는 없습니다",
    lede: "주소가 바뀌었거나, 애초에 공개된 적이 없는 글일 수 있습니다.",
    body: "다음 중에서 찾아보세요:",
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
  },
  notFound: {
    eyebrow: "404",
    title: "This page isn’t here",
    lede: "The address may have changed, or the piece may never have been published.",
    body: "Try one of these:",
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
