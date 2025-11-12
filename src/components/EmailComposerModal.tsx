import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any;
  checklistItem: any;
  onEmailSent: (emailRecord: any) => void;
}

interface ContactMatrix {
  [department: string]: {
    primary: string;
    cc: string[];
  };
}

export function EmailComposerModal({ 
  isOpen, 
  onClose, 
  claim, 
  checklistItem, 
  onEmailSent 
}: EmailComposerModalProps) {
  const [from, setFrom] = useState('user@domain.com');
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [newToEmail, setNewToEmail] = useState('');
  const [newCcEmail, setNewCcEmail] = useState('');

  // Department Contact Matrix (dummy data as requested)
  const contactMatrix: ContactMatrix = {
    'Emergency Department': {
      primary: 'emergency@alahli.com',
      cc: ['nursing.ed@alahli.com', 'admin.ed@alahli.com']
    },
    'Radiology': {
      primary: 'radiology@alahli.com', 
      cc: ['tech.radiology@alahli.com']
    },
    'Laboratory': {
      primary: 'lab@alahli.com',
      cc: ['pathology@alahli.com']
    },
    'Pharmacy': {
      primary: 'pharmacy@alahli.com',
      cc: ['clinical.pharmacy@alahli.com']
    },
    'Finance': {
      primary: 'finance@alahli.com',
      cc: ['billing@alahli.com', 'accounts@alahli.com']
    },
    'GSD': {
      primary: 'gsd@alahli.com',
      cc: ['support.gsd@alahli.com']
    },
    'Claims Processing': {
      primary: 'claims@alahli.com',
      cc: ['claims.supervisor@alahli.com']
    }
  };

  // Initialize email fields when modal opens
  useEffect(() => {
    if (isOpen && claim && checklistItem) {
      // Generate subject
      const generatedSubject = `${checklistItem.title} failed — Claim ${claim.id}`;
      setSubject(generatedSubject);

      // Determine department and set To/CC
      const department = getDepartmentForChecklist(checklistItem);
      const contacts = contactMatrix[department];
      if (contacts) {
        setTo([contacts.primary]);
        setCc(contacts.cc);
      }

      // Generate email body
      const generatedBody = generateEmailBody(claim, checklistItem, department);
      setBody(generatedBody);

      // Reset other fields
      setError('');
      setIsSending(false);
    }
  }, [isOpen, claim, checklistItem]);

  const getDepartmentForChecklist = (item: any): string => {
    // Map checklist categories to departments
    const categoryToDepartment: { [key: string]: string } = {
      'ClaimForm': 'Claims Processing',
      'Approval': 'GSD', 
      'Invoice': 'Finance',
      'Investigation': 'GSD'
    };

    // Find which category this checklist item belongs to
    if (claim?.aiData?.Checklist) {
      for (const [category, items] of Object.entries(claim.aiData.Checklist)) {
        if (Array.isArray(items) && items.find((i: any) => i.id === item.id)) {
          return categoryToDepartment[category] || 'GSD';
        }
      }
    }
    
    return 'GSD'; // Default fallback
  };

  const generateEmailBody = (claim: any, checkItem: any, department: string): string => {
    const claimData = claim.aiData?.Claim || {};
    
    return `Dear ${department} Team,

Claim: ${claim.id} — Patient: ${claimData.patientName || claim.patientName} — Visit: ${claimData.visitDate || 'N/A'}

Issue: ${checkItem.title} — ${checkItem.reason || 'Failed validation'}


Please provide approval / clarification for the above so we can proceed with claim processing.

Regards`;
  };

  const addToEmail = () => {
    if (newToEmail.trim() && !to.includes(newToEmail.trim())) {
      setTo([...to, newToEmail.trim()]);
      setNewToEmail('');
    }
  };

  const addCcEmail = () => {
    if (newCcEmail.trim() && !cc.includes(newCcEmail.trim())) {
      setCc([...cc, newCcEmail.trim()]);
      setNewCcEmail('');
    }
  };

  const removeToEmail = (email: string) => {
    setTo(to.filter(e => e !== email));
  };

  const removeCcEmail = (email: string) => {
    setCc(cc.filter(e => e !== email));
  };

  const handleSend = async () => {
    if (!to.length) {
      setError('At least one recipient is required');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      
      // No attachments needed as per requirement
      const attachments: string[] = [];

      const emailData = {
        claimId: claim.id,
        from,
        to,
        cc,
        subject,
        htmlBody: body.replace(/\n/g, '<br>'),
        attachments
      };

      const response = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();
      
      if (result.ok) {
        onEmailSent(result.emailRecord);
        onClose();
      } else {
        setError(result.error || 'Failed to send email');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Raise Query - Send Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* From Field */}
          <div>
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="your.email@domain.com"
            />
          </div>

          {/* To Field */}
          <div>
            <Label>To</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {to.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeToEmail(email)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newToEmail}
                onChange={(e) => setNewToEmail(e.target.value)}
                placeholder="Add recipient email"
                onKeyPress={(e) => e.key === 'Enter' && addToEmail()}
              />
              <Button type="button" variant="outline" size="sm" onClick={addToEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* CC Field */}
          <div>
            <Label>CC</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {cc.map((email) => (
                <Badge key={email} variant="outline" className="flex items-center gap-1">
                  {email}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeCcEmail(email)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCcEmail}
                onChange={(e) => setNewCcEmail(e.target.value)}
                placeholder="Add CC email"
                onKeyPress={(e) => e.key === 'Enter' && addCcEmail()}
              />
              <Button type="button" variant="outline" size="sm" onClick={addCcEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body Field */}
          <div>
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>


          {/* Error Display */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
