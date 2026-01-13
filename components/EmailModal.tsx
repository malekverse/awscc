'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Member {
  _id: string;
  fullName: string;
  email: string;
  organization?: string;
  paid: boolean;
  emailSent: boolean;
  paidDate?: string;
  paidBy?: string;
  submissionDate: string;
  lastLogin?: string;
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
}

interface EmailTemplate {
  subject: string;
  content: string;
}

interface EmailTemplates {
  [key: string]: EmailTemplate;
}

export default function EmailModal({ isOpen, onClose, members }: EmailModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState<'all' | 'multiple' | 'single'>('all');
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Email templates
  const emailTemplates: EmailTemplates = {
    welcome: {
      subject: 'Welcome to AWS Cloud Club ISIMS!',
      content: `Dear {{name}},

Welcome to the AWS Cloud Club ISIMS! We're excited to have you join our community of cloud enthusiasts.

Your membership registration has been successfully processed. Here's what you can expect as a member:

• Access to exclusive workshops and training sessions
• Networking opportunities with industry professionals
• Hands-on experience with AWS technologies
• Collaboration on real-world cloud projects
• Preparation resources for AWS certifications

We'll be in touch soon with details about upcoming events and how you can get involved.

Best regards,
AWS Cloud Club ISIMS Team`
    },
    reminder: {
      subject: 'Payment Reminder - AWS Cloud Club ISIMS',
      content: `Dear {{name}},

This is a friendly reminder that your membership payment for AWS Cloud Club ISIMS is still pending.

To complete your membership and gain access to all our exclusive benefits, please process your payment at your earliest convenience.

If you have any questions or need assistance with the payment process, please don't hesitate to contact us.

Best regards,
AWS Cloud Club ISIMS Team`
    },
    announcement: {
      subject: 'Important Announcement - AWS Cloud Club ISIMS',
      content: `Dear {{name}},

We have an important announcement to share with our AWS Cloud Club ISIMS community.

[Your announcement content here]

Stay tuned for more updates and exciting opportunities!

Best regards,
AWS Cloud Club ISIMS Team`
    },
    event: {
      subject: 'Upcoming Event - AWS Cloud Club ISIMS',
      content: `Dear {{name}},

We're excited to invite you to our upcoming event!

Event Details:
• Date: [Event Date]
• Time: [Event Time]
• Location: [Event Location]
• Topic: [Event Topic]

Don't miss this opportunity to learn and network with fellow cloud enthusiasts!

Best regards,
AWS Cloud Club ISIMS Team`
    }
  };

  // Initialize email content when template changes or modal opens
  useEffect(() => {
    if (isOpen && selectedTemplate && (!emailSubject || !emailContent)) {
      const template = emailTemplates[selectedTemplate];
      if (template) {
        setEmailSubject(template.subject);
        setEmailContent(template.content);
      }
    }
  }, [isOpen, selectedTemplate, emailSubject, emailContent]);

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = emailTemplates[templateKey];
    if (template) {
      setEmailSubject(template.subject);
      setEmailContent(template.content);
    }
  };

  const toggleRecipientSelection = (memberId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSendEmails = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      alert('Please fill in both subject and content.');
      return;
    }

    if (recipientType !== 'all' && selectedRecipients.length === 0) {
      alert('Please select at least one recipient.');
      return;
    }

    setIsEmailSending(true);
    try {
      const recipients = recipientType === 'all' 
        ? members.map(m => ({ email: m.email, name: m.fullName }))
        : members
            .filter(m => selectedRecipients.includes(m._id))
            .map(m => ({ email: m.email, name: m.fullName }));

      const response = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: emailSubject,
          content: emailContent,
          recipients
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Emails sent successfully! ${result.successCount} sent, ${result.failureCount} failed.`);
        onClose();
        // Reset form
        setSelectedRecipients([]);
        setRecipientType('all');
        setSelectedTemplate('welcome');
      } else {
        alert(`Failed to send emails: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails. Please try again.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary to-[#7C4DFF] rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Send Emails</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6 bg-card">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            >
              <option value="welcome">Welcome Email</option>
              <option value="reminder">Payment Reminder</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event Invitation</option>
            </select>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter email subject"
            />
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Content
            </label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter email content. Use {{name}} to personalize with member names."
            />
            <p className="text-sm text-muted-foreground mt-1">
              Tip: Use {{name}} in your content to automatically insert each member's name.
            </p>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Recipients
            </label>
            <div className="space-y-3">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recipientType"
                    value="all"
                    checked={recipientType === 'all'}
                    onChange={(e) => setRecipientType(e.target.value as 'all')}
                    className="mr-2 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">All Members ({members.length})</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recipientType"
                    value="multiple"
                    checked={recipientType === 'multiple'}
                    onChange={(e) => setRecipientType(e.target.value as 'multiple')}
                    className="mr-2 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Select Multiple</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recipientType"
                    value="single"
                    checked={recipientType === 'single'}
                    onChange={(e) => setRecipientType(e.target.value as 'single')}
                    className="mr-2 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Single Member</span>
                </label>
              </div>

              {/* Member Selection List */}
              {recipientType !== 'all' && (
                <div className="border border-border rounded-md max-h-60 overflow-y-auto bg-background">
                  <div className="p-3 bg-muted border-b border-border">
                    <span className="text-sm font-medium text-foreground">
                      Select Recipients ({selectedRecipients.length} selected)
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {members.map((member) => (
                      <label key={member._id} className="flex items-center p-3 hover:bg-muted cursor-pointer">
                        <input
                          type={recipientType === 'single' ? 'radio' : 'checkbox'}
                          name={recipientType === 'single' ? 'singleRecipient' : undefined}
                          checked={selectedRecipients.includes(member._id)}
                          onChange={() => {
                            if (recipientType === 'single') {
                              setSelectedRecipients([member._id]);
                            } else {
                              toggleRecipientSelection(member._id);
                            }
                          }}
                          className="mr-3 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary-foreground font-medium text-xs">
                                {member.fullName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{member.fullName}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.paid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary border border-border rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmails}
              disabled={isEmailSending}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isEmailSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Sending...
                </>
              ) : (
                'Send Emails'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}