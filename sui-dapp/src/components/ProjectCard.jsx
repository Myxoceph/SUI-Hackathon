import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";

const ProjectCard = ({ badge, title, description, author, time, onEndorse }) => (
  <div className="group border border-border bg-card hover:border-primary/50 transition-colors p-6 space-y-4 flex flex-col">
    <div className="flex justify-between items-start">
      <Badge variant="outline" className="rounded-none font-mono text-xs">
        {badge}
      </Badge>
      <span className="text-xs font-mono text-muted-foreground">{time}</span>
    </div>
    
    <div className="space-y-2 flex-1">
      <h3 className="font-bold text-lg font-sans group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-3">
        {description}
      </p>
    </div>

    <div className="pt-4 border-t border-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-muted rounded-full border border-border" />
        <span className="text-xs font-mono">{author}</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 text-xs font-mono hover:bg-primary hover:text-primary-foreground gap-2"
        onClick={onEndorse}
      >
        <ThumbsUp className="h-3 w-3" />
        ENDORSE
      </Button>
    </div>
  </div>
);

export default ProjectCard;
