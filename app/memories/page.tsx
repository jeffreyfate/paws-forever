// app/memories/page.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Memory = {
  title: string;
  date?: string;
  excerpt: string;
  fullStory: string;
};

const memories: Memory[] = [
  {
    title: "The Day We Met",
    date: "June 2015",
    excerpt: "A rainy afternoon at the shelter changed everything...",
    fullStory: "We walked in just to look, but when those big brown eyes locked onto ours, we knew. The tail wag never stopped from that moment on.",
  },
  {
    title: "First Beach Trip",
    date: "August 2016",
    excerpt: "Chasing waves and digging endless holes...",
    fullStory: "Sand everywhere, but the joy on their face made every grain worth it. Sunset walks became our ritual.",
  },
  {
    title: "The Loyal Companion Years",
    date: "2017–2023",
    excerpt: "Through every high and low, always by our side.",
    fullStory: "Late-night cuddles, morning runs, quiet evenings on the couch. Unconditional love in its purest form.",
  },
  // Add as many as you like — or make it dynamic later
];

export default function Memories() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
        Cherished Memories
      </h1>
      <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
        Stories and moments that live on forever in our hearts.
      </p>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {memories.map((mem, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left hover:no-underline">
                <div>
                  <h3 className="text-lg font-semibold">{mem.title}</h3>
                  {mem.date && (
                    <p className="text-sm text-muted-foreground">{mem.date}</p>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground mb-4">{mem.excerpt}</p>
                <p className="leading-relaxed">{mem.fullStory}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Alternative: Simple card grid if you prefer non-collapsible */}
        {/* Uncomment if you want cards instead */}
        {/* <div className="grid gap-6 md:grid-cols-2">
          {memories.map((mem, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>{mem.title}</CardTitle>
                {mem.date && <CardDescription>{mem.date}</CardDescription>}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{mem.fullStory}</p>
              </CardContent>
            </Card>
          ))}
        </div> */}
      </div>
    </div>
  );
}