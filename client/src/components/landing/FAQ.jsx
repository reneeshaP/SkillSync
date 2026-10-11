import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/Accordion';
import ScrollReveal from './ScrollReveal';

const FAQS = [
  {
    q: 'Is it free?',
    a: "Yes — SkillSync is free to use while it's in beta.",
  },
  {
    q: 'How does the matching work?',
    a: 'We turn your skills, bio, and experience into an AI embedding and rank the opposite role by how closely it matches yours, so suggestions are based on real skill overlap, not keywords.',
  },
  {
    q: 'How do sessions get scheduled?',
    a: 'Mentors publish open availability slots. Mentees pick one and book it with a topic; the mentor then confirms or declines.',
  },
  {
    q: 'Can I be both a mentor and a mentee?',
    a: "Each account has one role, chosen when you sign up. If you want to experience both sides, you're welcome to create a second account.",
  },
  {
    q: 'What happens right after I sign up?',
    a: "You'll choose your role, fill in your skills, bio, and experience, and land straight in your matches — no waiting period.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <ScrollReveal>
        <h2 className="text-h2 font-display font-bold text-text text-center">Frequently asked questions</h2>
      </ScrollReveal>

      <ScrollReveal delay={0.1} className="mt-10">
        <Accordion type="single" collapsible>
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </section>
  );
}
