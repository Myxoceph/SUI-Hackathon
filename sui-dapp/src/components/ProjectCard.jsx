import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ExternalLink, Info } from "lucide-react";
import { formatAddress, formatTimeAgo } from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ProjectCard = ({ 
  id,
  type, 
  title, 
  description, 
  owner, 
  createdAt, 
  endorsements = 0,
  proofLink,
  onEndorse,
  currentUserAddress,
  isEndorsing,
  hasEndorsed // New prop - has user already endorsed this?
}) => {
  const { t } = useTranslation();
  const isOwnContribution = currentUserAddress && owner && 
    currentUserAddress.toLowerCase() === owner.toLowerCase();
  const timeAgo = formatTimeAgo(createdAt);
  
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
            {t('components.projectCard.viewProof')} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-muted rounded-full border border-border flex items-center justify-center text-xs">
            0x
          </div>
          <span className="text-xs font-mono">{shortAddress}</span>
          {isOwnContribution && (
            <Badge variant="secondary" className="text-xs">{t('components.common.you')}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs font-mono hover:bg-primary hover:text-primary-foreground gap-2"
            onClick={() => onEndorse(id)}
            disabled={isOwnContribution || isEndorsing || hasEndorsed}
            title={
              isOwnContribution 
                ? t('components.projectCard.cannotEndorseOwn')
                : hasEndorsed
                ? t('components.projectCard.alreadyEndorsed')
                : t('components.projectCard.endorseThis')
            }
          >
            <ThumbsUp className={`h-3 w-3 ${hasEndorsed ? 'fill-current' : ''}`} />
            {endorsements > 0 ? `${endorsements}` : hasEndorsed ? t('components.projectCard.endorsed') : t('common.endorse')}
          </Button>
          
          {endorsements > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold">{t('components.projectCard.endorsementTransparency')}</p>
                    <p className="text-muted-foreground">
                      {t('components.projectCard.endorsementsOnChain', { count: endorsements })}
                    </p>
                    <p className="text-yellow-500 text-[10px]">
                      ⚠️ {t('components.projectCard.collusionWarning')}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
