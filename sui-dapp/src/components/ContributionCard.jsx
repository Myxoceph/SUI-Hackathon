import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, ThumbsUp } from "lucide-react";

/**
 * Simple project card for display (used in Passport)
 * For interactive card with endorsement, see ProjectCard.jsx
 */
const ProjectCardSimple = ({ type, title, description, date, endorsements }) => (
  <div className="flex gap-4 p-4 border border-border bg-card hover:bg-accent/5 transition-colors group">
    <div className="flex flex-col items-center gap-2 pt-1">
      <div className="h-2 w-2 rounded-full bg-primary" />
      <div className="w-[1px] h-full bg-border group-last:hidden" />
    </div>
    <div className="flex-1 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs uppercase rounded-none border-primary/50 text-primary">
              {type}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{date}</span>
          </div>
          <h3 className="font-bold text-lg font-sans">{title}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <ThumbsUp className="h-3 w-3" />
          {endorsements} Endorsements
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-green-500">
          <CheckCircle className="h-3 w-3" />
          Verified on Sui
        </div>
      </div>
    </div>
  </div>
);

// Backward compatibility export
export default ProjectCardSimple;
export { ProjectCardSimple as ContributionCard };
