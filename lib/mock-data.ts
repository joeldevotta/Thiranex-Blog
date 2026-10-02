import type { Comment, Post, User } from './types'

export const MOCK_PASSWORD = 'password'

export const seedUsers: User[] = [
  {
    id: 'u1',
    name: 'Elena Vance',
    email: 'elena@chronicle.dev',
    title: 'Product Engineer & Systems Columnist',
    bio: 'Elena leads frontend infrastructure and real-time collaboration engines at Chronicle. She writes on the intersections of ergonomics, TypeScript mechanics, and digital calm.',
  },
  {
    id: 'u2',
    name: 'Marcus Vance',
    email: 'marcus@chronicle.dev',
    title: 'Infrastructure Lead',
    bio: 'Marcus runs the realtime platform team and has strong opinions about garbage collectors.',
  },
  {
    id: 'u3',
    name: 'Dr. Aris Thorne',
    email: 'aris@chronicle.dev',
    title: 'Reading Researcher',
    bio: 'Aris studies how typography and layout shape comprehension in longform reading.',
  },
  {
    id: 'u4',
    name: 'Mia Chen',
    email: 'mia@chronicle.dev',
    title: 'Design Technologist',
    bio: 'Mia bridges design systems and production code, one token at a time.',
  },
  {
    id: 'u5',
    name: 'Dr. Soren Patel',
    email: 'soren@chronicle.dev',
    title: 'Principal Architect',
    bio: 'Soren writes about architecture, code review culture, and working alongside machine collaborators.',
  },
  {
    id: 'u6',
    name: 'Jonas Lindqvist',
    email: 'jonas@chronicle.dev',
    title: 'Fullstack Engineer',
    bio: 'Jonas is in his first years in industry and writes honestly about what he is learning.',
  },
]

const author = (id: string) => {
  const user = seedUsers.find((u) => u.id === id)!
  return { id: user.id, name: user.name }
}

const daysAgo = (days: number, hours = 0) => new Date(Date.now() - (days * 24 + hours) * 3600 * 1000).toISOString()

export const seedPosts: Post[] = [
  {
    id: 'p1',
    title: 'Designing Systems that Scale: Lessons from my First Year as a Product Engineer',
    excerpt:
      'Technical debt accumulates not from messy logic, but from unbounded freedom. What a year of scaling taught me about constraints.',
    category: 'Engineering',
    cover_image: '/images/cover-systems.png',
    author: author('u1'),
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    tags: ['Engineering', 'DesignSystems', 'Architecture', 'Career'],
    featured: true,
    likes: 428,
    content: `When I joined Chronicle twelve months ago, I was convinced that great product engineering was primarily an exercise in raw execution: write cleaner functions, optimize component re-renders, and compress query latency. What I didn't anticipate was how rapidly technical debt accumulates not from messy logic, but from unbounded freedom.

In early-stage scaling, every engineer has good intentions. You create a custom modal here, patch a micro-cache there, and assemble tailor-made data fetchers for idiosyncratic user workflows. By month six, your application is a mosaic of localized optimizations, each functioning correctly in isolation, yet together exerting devastating friction upon team velocity.

> The greatest leverage in design engineering isn't writing more components. It's creating constraints that eliminate unnecessary decisions.
> — Core Principle, Architecture Guild

## 1. The Illusion of Infinite Flexibility

When component interfaces become overly permissive, they outsource architectural judgment to downstream consumers. If a button component accepts twenty optional styling flags, three variant types, and unrestricted CSS class injections, you do not have a design system: you have an expensive CSS wrapper.

Our breaking point occurred during our collaborative comments rewrite. Four different subteams were maintaining distinct state machines for text selection overlays, leading to synchronization locks across concurrent client connections:

- **Pessimistic State Enclaves:** Subscriptions were duplicating synchronization handshakes across independent browser tabs.
- **Style Divergence:** Tooltips had drifted into three subtly different border-radius tokens, breaking visual coherence.
- **Payload Bloat:** Over 44KB of redundant memoization code was being downloaded to calculate static reading positions.

\`\`\`sync-engine.ts
// Invariant Contract: Deterministic State Propagation
export async function bindCollaborativeThread(
  threadId: string,
  actor: SessionActor
): Promise<ThreadState> {
  // 1. Enforce strict single-flight state reconciliation
  const baseline = await StateRegistry.resolveSnapshot(threadId);

  if (!baseline.isEligible(actor.permissions)) {
    throw new SecurityContextError('UNAUTHORIZED_THREAD_JOIN');
  }

  return ThreadBus.streamDeltas({
    channel: \`chronicle:threads:\${threadId}\`,
    hydrationWindowMs: 120,
  });
}
\`\`\`

!! Key Architecture Takeaway
Before writing a new abstraction, measure the blast radius of deprecation. If your component is designed so generically that changing it requires coordinating across four squads, you haven't reduced complexity. You've simply institutionalized it.

## 2. The Long-Term Economics of Simplicity

By shifting from bespoke per-feature optimization to uniform, constraint-driven system patterns, our release defect count dropped by 64% over three quarters. More importantly, onboarding time for junior engineers plummeted from six weeks to under eleven days. They no longer had to memorize hundreds of unwritten idioms: the architecture made doing the right thing the easiest path forward.

Systems design is not a monument you build to celebrate complexity. It is an honest, ongoing practice of subtracting everything that stands between the writer's thought and the reader's comprehension.`,
  },
  {
    id: 'p2',
    title: 'Why We Rebuilt Our Real-Time Sync Engine in Rust',
    excerpt:
      'How migrating our WebSockets ingestion tier eliminated GC pause micro-stutters and cut cloud compute expenses by 48%.',
    category: 'Infrastructure',
    cover_image: '/images/cover-rust.png',
    author: author('u2'),
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    tags: ['Rust', 'Realtime', 'Performance'],
    featured: true,
    likes: 356,
    content: `For two years our realtime tier ran on a garbage-collected runtime, and for two years it was fine. Then our largest customers started opening documents with four hundred concurrent editors, and "fine" became a forty-millisecond stutter every few seconds.

## The problem with pauses

GC pauses are rarely the headline in a postmortem. They show up as a vague feeling that the cursor is "sticky." We instrumented every frame and found the culprit: allocation spikes during fan-out of presence updates.

- **Fan-out amplification:** one keystroke produced hundreds of short-lived buffers.
- **Tail latency:** p99 broadcast time was 9x the median.
- **Cost:** we were over-provisioning to hide pauses rather than fixing them.

## What Rust changed

Ownership forced us to design the broadcast path around borrowed, reference-counted frames. The rewrite was smaller than the original and the p99 dropped below the median of the old system.

> Rewrites are only worth it when the new constraints make the old bugs impossible to express.
> — Platform team retro

We did not rewrite everything. The control plane is still in TypeScript, and it should stay there. Pick the hot path, prove the win, and stop.`,
  },
  {
    id: 'p3',
    title: 'The Typography of Longform Reading: Measuring Cognitive Retention',
    excerpt:
      'An empirical study comparing reading cadence and comprehension across serifs, sans-serifs, and dynamic vertical rhythm grids.',
    category: 'Design',
    cover_image: '/images/cover-typography.png',
    author: author('u3'),
    created_at: daysAgo(6),
    updated_at: daysAgo(5),
    tags: ['Typography', 'Research', 'Reading'],
    featured: true,
    likes: 291,
    content: `We asked 1,200 readers to read the same 3,000-word essay in six typographic configurations, then quizzed them a day later. The differences were smaller than designers like to believe, and larger than engineers tend to assume.

## Measure matters more than face

The single largest effect came from line length. Readers with a measure between 60 and 72 characters retained 18% more detail than those reading at 100+ characters, regardless of typeface.

- **Serif vs sans:** no significant difference in retention on high-DPI screens.
- **Line height:** 1.6 to 1.7 outperformed tighter settings for body copy.
- **Vertical rhythm:** consistent spacing reduced re-reading by 11%.

## Designing for calm

The best-performing layout was also the least decorated: a generous measure, quiet headings, and pull quotes used sparingly. Readers described it as "calm," which is perhaps the highest compliment a reading interface can earn.`,
  },
  {
    id: 'p4',
    title: 'Shipping the Smallest Lovable Thing',
    excerpt: 'Why our best launches started as embarrassingly small experiments, and how we decide what to cut.',
    category: 'Product',
    cover_image: '/images/cover-product.png',
    author: author('u4'),
    created_at: daysAgo(8),
    updated_at: daysAgo(8),
    tags: ['Product', 'Discovery', 'Strategy'],
    likes: 187,
    content: `"Minimum viable" has become an excuse for shipping things nobody wants to use. We replaced it with a different bar: what is the smallest version of this that someone would genuinely love?

## Cut scope, not care

Every feature has a core moment. For comments, it is the instant someone replies to you. We shipped threads with no editing, no reactions, and no notifications settings, but that reply moment was polished to a mirror.

- **Name the moment:** write one sentence describing what the user will feel.
- **Protect it:** anything that does not serve that moment waits.
- **Measure it:** instrument the moment, not the feature.

Small, loved things grow. Large, tolerated things get rewritten.`,
  },
  {
    id: 'p5',
    title: 'Pairing with Models: What AI Changed About Code Review',
    excerpt: 'Machine reviewers are fast and tireless. They also changed what humans should be looking for.',
    category: 'AI',
    cover_image: '/images/cover-ai.png',
    author: author('u5'),
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
    tags: ['AI', 'CodeReview', 'Culture'],
    likes: 244,
    content: `Six months after adding an AI reviewer to every pull request, our human review comments changed character. Fewer nitpicks, more questions about intent.

## Let machines check, let humans ask

Automated reviewers are excellent at the mechanical: missing null checks, inconsistent naming, forgotten tests. That frees human reviewers for the questions only they can ask.

- **Does this solve the right problem?**
- **Will the next person understand why?**
- **What breaks if we are wrong?**

> A good review is a conversation about the future, not a lint pass over the present.
> — Architecture Guild

The tools did not make review faster. They made it better, which turned out to be more valuable.`,
  },
  {
    id: 'p6',
    title: 'Notes from a First Internship: Always Ask the Second Question',
    excerpt: 'The first answer tells you what. The second tells you why, and that is where the learning is.',
    category: 'Career',
    cover_image: '/images/cover-career.png',
    author: author('u6'),
    created_at: daysAgo(13),
    updated_at: daysAgo(13),
    tags: ['Career', 'Internship', 'Learning'],
    likes: 162,
    content: `When you are new, it is tempting to take the first answer and run. "We use this queue because it's what we use." Fine. But the second question, "what happened before we used it?", is where the real story lives.

## Curiosity compounds

Every time I asked a second question, I learned about an incident, a trade-off, or a person who had thought hard about the problem. Those stories made the codebase make sense.

- **Ask about history,** not just usage.
- **Write it down,** because you will forget.
- **Share it back** in the team docs.

Studying CS, you evaluate code by algorithmic purity. In industry, code is evaluated by whether your teammates can refactor it on a Friday afternoon without breaking production.`,
  },
  {
    id: 'p7',
    title: 'Tokens All the Way Down: Keeping Design and Code in Sync',
    excerpt: 'How we moved from hand-copied hex values to a single token pipeline shared by Figma and Tailwind.',
    category: 'Design',
    cover_image: '',
    author: author('u1'),
    created_at: daysAgo(16),
    updated_at: daysAgo(15),
    tags: ['DesignSystems', 'Tokens', 'Tailwind'],
    likes: 133,
    content: `Our design tokens used to live in three places: a Figma library, a Tailwind config, and a spreadsheet nobody trusted. Now they live in one JSON file, and everything else is generated.

## One source, many outputs

The pipeline is deliberately boring. A JSON file defines semantic tokens, a build step emits CSS variables, and Tailwind reads those variables.

- **Semantic names first:** surface, on-surface, primary, never "blue-500".
- **Generated, never edited:** outputs are build artifacts.
- **Reviewed like code:** token changes go through pull requests.

The result is less exciting than a new component library, and far more useful.`,
  },
  {
    id: 'p8',
    title: 'The Quiet Cost of Feature Flags',
    excerpt: 'Flags let you ship safely. Left unchecked, they also let you ship a combinatorial explosion.',
    category: 'Engineering',
    cover_image: '',
    author: author('u2'),
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
    tags: ['Engineering', 'Process'],
    likes: 98,
    content: `We had 214 active feature flags last spring. Nobody could tell you which combinations had ever been tested together.

## Flags are debt with an interest rate

Every flag doubles the number of possible states. Most of those states will never exist in production, but some will, and they will be the ones that page you at 3am.

- **Give every flag an owner** and an expiry date.
- **Delete aggressively** once a rollout reaches 100%.
- **Alert on stale flags** older than ninety days.

We are down to 41 flags. Deploys are calmer, and so are we.`,
  },
]

export const seedComments: Comment[] = [
  {
    id: 'c1',
    post_id: 'p1',
    parent_id: null,
    content:
      "The point about over-parameterized button components hits so close to home. Teams treat flexibility as a virtue, but in library design, an unconstrained prop API is essentially giving up on finding product-market fit for your primitives.",
    author: author('u5'),
    created_at: daysAgo(0, 4),
    likes: 42,
  },
  {
    id: 'c2',
    post_id: 'p1',
    parent_id: 'c1',
    content:
      'Exactly Soren. The phrase we keep repeating in triage is: "If three components do 80% of the same thing, find why the 20% diverges rather than allowing a 4th wrapper."',
    author: author('u1'),
    created_at: daysAgo(0, 2),
    likes: 19,
  },
  {
    id: 'c3',
    post_id: 'p1',
    parent_id: 'c2',
    content: 'Stealing this for our next design system review.',
    author: author('u4'),
    created_at: daysAgo(0, 1),
    likes: 6,
  },
  {
    id: 'c4',
    post_id: 'p1',
    parent_id: null,
    content:
      'Would love a follow-up on how your design and engineering tokens stay synchronized! Did you adopt automated JSON token transforms or are tokens codified by hand in Tailwind configs?',
    author: author('u4'),
    created_at: daysAgo(0, 7),
    likes: 14,
  },
  {
    id: 'c5',
    post_id: 'p1',
    parent_id: null,
    content:
      'This is easily the most coherent description of the first-year realization I have read. Code is evaluated by whether your teammates can refactor it on a Friday afternoon without breaking production.',
    author: author('u6'),
    created_at: daysAgo(1, 3),
    likes: 27,
  },
  {
    id: 'c6',
    post_id: 'p2',
    parent_id: null,
    content: 'Did you consider tuning the GC before the rewrite? Curious what the numbers looked like.',
    author: author('u6'),
    created_at: daysAgo(3),
    likes: 8,
  },
  {
    id: 'c7',
    post_id: 'p2',
    parent_id: 'c6',
    content: 'We did for about a quarter. It bought us 20%, but the tail never really moved.',
    author: author('u2'),
    created_at: daysAgo(2, 20),
    likes: 11,
  },
]
