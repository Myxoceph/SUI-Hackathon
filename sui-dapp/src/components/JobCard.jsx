import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Clock, 
  Users, 
  CheckCircle2, 
  Send,
  User,
  Loader2,
  X
} from "lucide-react";
import { formatAddress, formatSui, formatTimeAgo } from "@/lib/formatters";
import { JOB_STATUS, JOB_STATUS_LABELS } from "@/config/contracts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const JobCard = ({ 
  job,
  currentUserAddress,
  isProcessing,
  hasApplied,
  onApply,
  onAssign,
  onConfirmCompletion,
  onLoadApplicants,
  applicants,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const {
    id,
    owner,
    title,
    description,
    tags,
    budgetSui,
    status,
    assignedTo,
    ownerConfirmed,
    workerConfirmed,
    applicantCount,
    createdAt,
  } = job;

  const isOwner = currentUserAddress && owner && 
    currentUserAddress.toLowerCase() === owner.toLowerCase();
  const isAssignedWorker = currentUserAddress && assignedTo && 
    currentUserAddress.toLowerCase() === assignedTo.toLowerCase();

  // Format time - createdAt might be epoch number or timestamp
  const timeAgo = formatTimeAgo(createdAt);
  
  const shortAddress = owner ? formatAddress(owner) : 'anonymous';
  const budgetFormatted = formatSui(budgetSui);

  const getStatusColor = () => {
    switch (status) {
      case JOB_STATUS.OPEN: return 'bg-green-500/10 text-green-500 border-green-500/30';
      case JOB_STATUS.ASSIGNED: return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case JOB_STATUS.COMPLETED: return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case JOB_STATUS.CANCELLED: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      default: return '';
    }
  };

  const handleApplySubmit = () => {
    onApply(id, coverLetter);
    setShowApplyModal(false);
    setCoverLetter('');
  };

  const canApply = status === JOB_STATUS.OPEN && !isOwner && !hasApplied;
  const canConfirm = status === JOB_STATUS.ASSIGNED && (
    (isOwner && !ownerConfirmed) || (isAssignedWorker && !workerConfirmed)
  );

  return (
    <>
      <div className="group border border-border bg-card hover:border-primary/50 transition-colors p-6 space-y-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={`rounded-none font-mono text-xs ${getStatusColor()}`}>
            {JOB_STATUS_LABELS[status]}
          </Badge>
          <div className="text-right">
            <span className="text-lg font-bold text-primary font-mono">{budgetFormatted} SUI</span>
          </div>
        </div>
        
        {/* Title & Description */}
        <div className="space-y-2 flex-1">
          <h3 className="font-bold text-lg font-sans group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="rounded-none text-xs font-mono"
              >
                #{tag}
              </Badge>
            ))}
            {tags.length > 4 && (
              <Badge variant="secondary" className="rounded-none text-xs font-mono">
                +{tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {applicantCount} applicants
          </span>
        </div>

        {/* Confirmation Status (for assigned jobs) */}
        {status === JOB_STATUS.ASSIGNED && (
          <div className="text-xs space-y-1 bg-muted/50 p-2 border border-border">
            <p className="font-mono text-muted-foreground">Completion Status:</p>
            <div className="flex gap-4">
              <span className={ownerConfirmed ? 'text-green-500' : 'text-muted-foreground'}>
                {ownerConfirmed ? '✓' : '○'} Owner
              </span>
              <span className={workerConfirmed ? 'text-green-500' : 'text-muted-foreground'}>
                {workerConfirmed ? '✓' : '○'} Worker
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted rounded-full border border-border flex items-center justify-center text-xs">
              <User className="h-3 w-3" />
            </div>
            <span className="text-xs font-mono">{shortAddress}</span>
            {isOwner && (
              <Badge variant="secondary" className="text-xs">YOU</Badge>
            )}
            {isAssignedWorker && (
              <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-500">ASSIGNED TO YOU</Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* Apply Button */}
            {canApply && (
              <Button 
                size="sm" 
                className="h-8 text-xs font-mono rounded-none gap-1"
                onClick={() => setShowApplyModal(true)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Apply
              </Button>
            )}

            {/* Already Applied Badge */}
            {hasApplied && status === JOB_STATUS.OPEN && (
              <Badge variant="outline" className="rounded-none text-xs bg-primary/10">
                Applied ✓
              </Badge>
            )}

            {/* Confirm Completion Button */}
            {canConfirm && (
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 text-xs font-mono rounded-none gap-1"
                onClick={() => onConfirmCompletion(id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Confirm Done
              </Button>
            )}

            {/* Owner: View Applicants */}
            {isOwner && status === JOB_STATUS.OPEN && applicantCount > 0 && (
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 text-xs font-mono rounded-none"
                onClick={async () => {
                  setShowApplicantsModal(true);
                  if (onLoadApplicants) {
                    setLoadingApplicants(true);
                    await onLoadApplicants(id);
                    setLoadingApplicants(false);
                  }
                }}
              >
                View Applicants ({applicantCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="font-sans">Apply for Job</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cover-letter" className="font-mono uppercase text-xs">
                Cover Letter / Message
              </Label>
              <Textarea
                id="cover-letter"
                placeholder="Introduce yourself and explain why you're a good fit for this job..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="rounded-none border-border min-h-[120px]"
              />
            </div>
            
            <div className="bg-muted/50 p-3 border border-border text-xs space-y-1">
              <p className="font-mono text-muted-foreground">Budget: <span className="text-primary font-bold">{budgetFormatted} SUI</span></p>
              <p className="font-mono text-muted-foreground">
                Payment will be released when both parties confirm completion.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApplyModal(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApplySubmit}
              disabled={!coverLetter.trim() || isProcessing}
              className="rounded-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Applicants Modal */}
      <Dialog open={showApplicantsModal} onOpenChange={setShowApplicantsModal}>
        <DialogContent className="rounded-none border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans">Job Applicants</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {applicantCount} applicant{applicantCount !== 1 ? 's' : ''} for "{title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
            {loadingApplicants ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : applicants && applicants.length > 0 ? (
              applicants.map((applicant, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full border border-border flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-sm">{formatAddress(applicant)}</span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs font-mono rounded-none"
                    onClick={() => {
                      onAssign(id, applicant);
                      setShowApplicantsModal(false);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Assign'
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No applicants yet</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApplicantsModal(false)}
              className="rounded-none w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobCard;
