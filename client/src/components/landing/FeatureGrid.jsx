import { Sparkles, MessageCircle, Calendar, Star, Newspaper, Bell } from 'lucide-react';
import { Card } from '../ui/Card';
import { MatchScore } from '../ui/MatchScore';
import ScrollReveal from './ScrollReveal';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI skill matching',
    body: 'Gemini-powered embeddings of your skills, bio, and experience rank the best-fit mentors or mentees for you.',
    big: true,
    visual: true,
  },
  {
    icon: MessageCircle,
    title: 'Real-time chat',
    body: 'Live messaging with typing indicators, presence, attachments, and voice notes.',
  },
  {
    icon: Calendar,
    title: 'Session booking',
    body: "Book straight from a mentor's real, published availability.",
  },
  {
    icon: Star,
    title: 'Ratings & reviews',
    body: 'Mentees rate mentors after confirmed sessions — ratings show everywhere.',
  },
  {
    icon: Newspaper,
    title: 'Community feed',
    body: 'Share posts, comment, and connect with the wider SkillSync community.',
  },
  {
    icon: Bell,
    title: 'Live notifications',
    body: 'Connection requests, messages, and session updates land the moment they happen.',
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <ScrollReveal>
        <p className="text-overline uppercase tracking-wide text-accent font-semibold">Features</p>
        <h2 className="mt-2 text-h2 font-display font-bold text-text">Everything a mentorship actually needs.</h2>
      </ScrollReveal>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <ScrollReveal
              key={feature.title}
              delay={i * 0.05}
              className={feature.big ? 'sm:col-span-2' : ''}
            >
              <Card className="h-full p-6 group hover:border-border-strong transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-subtle text-brand">
                    <Icon size={20} />
                  </div>
                  {feature.visual && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MatchScore percent={87} size={36} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-h4 font-display font-semibold text-text">{feature.title}</h3>
                <p className="mt-1 text-body-sm text-text-muted">{feature.body}</p>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
