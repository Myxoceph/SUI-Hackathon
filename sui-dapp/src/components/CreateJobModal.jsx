import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Plus } from "lucide-react";
import { SKILL_TAGS } from "@/config/contracts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CreateJobModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    budgetSui: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
    const budgetMist = Math.floor(parseFloat(formData.budgetSui) * 1_000_000_000);
    
    onSubmit({
      title: formData.title,
      description: formData.description,
      tags: formData.tags,
      budgetSui: budgetMist,
    });
  };

  const addTag = (tag) => {
    const normalizedTag = tag.replace(/^#/, '').trim();
    if (normalizedTag && !formData.tags.includes(normalizedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, normalizedTag]
      }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  };

  const filteredSuggestions = SKILL_TAGS.filter(
    tag => 
      tag.toLowerCase().includes(tagInput.toLowerCase()) && 
      !formData.tags.includes(tag)
  ).slice(0, 6);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: [],
      budgetSui: '',
    });
    setTagInput('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-none border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl">Post a New Job</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Create a job listing and find talent. Payment in SUI.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-mono uppercase text-xs">
              Job Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g. Build DeFi Dashboard UI"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="rounded-none border-border"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-mono uppercase text-xs">
              Job Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the job requirements, deliverables, and any specific skills needed..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="rounded-none border-border min-h-[150px]"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="font-mono uppercase text-xs">
              Required Skills (Tags)
            </Label>
            
            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="rounded-none text-xs font-mono gap-1 pr-1"
                  >
                    #{tag}
                    <button 
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="relative">
              <Input
                placeholder="Type a skill and press Enter (e.g. JavaScript, React)"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => setShowTagSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                className="rounded-none border-border"
                disabled={formData.tags.length >= 10}
              />
              
              {/* Suggestions Dropdown */}
              {showTagSuggestions && tagInput && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border shadow-lg">
                  {filteredSuggestions.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted font-mono"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground font-mono">
              {formData.tags.length}/10 tags added. Popular: {SKILL_TAGS.slice(0, 5).map(t => `#${t}`).join(', ')}
            </p>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="font-mono uppercase text-xs">
              Budget (SUI) *
            </Label>
            <div className="relative">
              <Input
                id="budget"
                type="number"
                step="0.1"
                min="1"
                placeholder="100"
                value={formData.budgetSui}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetSui: e.target.value }))}
                className="rounded-none border-border pr-16"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground">
                SUI
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              ⚠️ Mockup Mode: Payment will NOT be deducted. Only gas fees apply.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 p-4 border border-border space-y-2 text-xs">
            <p className="font-mono font-bold">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground font-mono">
              <li>Post your job with required skills and budget</li>
              <li>Developers apply with their proposals</li>
              <li>You select and assign a developer</li>
              <li>Both parties confirm when job is complete</li>
              <li>Payment is released to the developer</li>
            </ul>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.budgetSui}
              className="rounded-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Job
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobModal;
