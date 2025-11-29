import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ExternalLink } from "lucide-react";
import { formatAddress } from "@/lib/formatters";

const ProjectCard = ({ 
  id,
  type, 
  title, 
  description, 
  owner, 
  createdAt, 
  endorsements = 0,
  proofLink,
  onEndorse 
}) => {
  const timeAgo = createdAt 
    ? new Date(createdAt).toLocaleDateString()
    : 'Recently';
  
  const shortAddress = owner ? formatAddress(owner) : 'anonymous';

  return (
    <div className="group border border-border bg-card hover:border-primary/50 transition-colors p-6 space-y-4 flex flex-col">
      <div className="flex justify-between items-start">
        <Badge variant="outline" className="rounded-none font-mono text-xs">
          {type}
        </Badge>
        <span className="text-xs font-mono text-muted-foreground">{timeAgo}</span>
      </div>
      
      <div className="space-y-2 flex-1">
        <h3 className="font-bold text-lg font-sans group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
        {proofLink && (
          <a 
            href={proofLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            View Proof <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-muted rounded-full border border-border flex items-center justify-center text-xs">
            0x
          </div>
          <span className="text-xs font-mono">{shortAddress}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-xs font-mono hover:bg-primary hover:text-primary-foreground gap-2"
          onClick={() => onEndorse(id)}
        >
          <ThumbsUp className="h-3 w-3" />
          {endorsements > 0 ? `${endorsements}` : 'ENDORSE'}
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
