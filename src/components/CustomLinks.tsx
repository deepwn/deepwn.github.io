import { ExternalLink, Github, Twitter, Linkedin, Mail, Globe, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomLinksConfig } from "@/services/github";

// Icon mapping for custom links
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Globe,
  BookOpen,
  FileText,
};

interface CustomLinksProps {
  customLinks: CustomLinksConfig | undefined;
}

export function CustomLinks({ customLinks }: CustomLinksProps) {
  if (!customLinks?.enabled || !customLinks?.links?.length) {
    return null;
  }

  return (
    <div className="pt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex flex-wrap justify-center gap-3">
        {customLinks.links.map((link, index) => {
          const IconComponent = link.icon ? iconMap[link.icon] : ExternalLink;
          const delay = index * 0.1;
          
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.3 + delay}s` }}
            >
              <Button
                variant={link.variant as 'default' | 'outline' | 'ghost' || 'default'}
                className={`
                  relative overflow-hidden rounded-full
                  bg-black/60 border border-white/20 backdrop-blur-xl
                  px-6 py-2.5
                  text-sm font-medium text-white
                  hover:bg-black/70 hover:border-green-500/30
                  transition-all duration-300 hover:scale-105
                  shadow-lg
                `}
              >
                <IconComponent size={16} className="mr-2" />
                {link.label}
              </Button>
            </a>
          );
        })}
      </div>
    </div>
  );
}
