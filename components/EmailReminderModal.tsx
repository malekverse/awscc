'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Send, AlertCircle, Users, Calendar, Megaphone, Bell, Search, UserCheck, UserX, Loader2, CheckCircle, Eye, Bold, Italic, List, Link, Plus } from 'lucide-react';

interface EmailReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (emailData: EmailReminderData) => Promise<void>;
  loading?: boolean;
}

export interface EmailReminderData {
  templateType: 'event' | 'announcement' | 'reminder' | 'custom';
  subject: string;
  message: string;
  recipientType: 'all' | 'multiple' | 'single';
  selectedMembers?: string[]; // Array of member IDs
  eventId?: string;
  scheduledDate?: string;
  customButton?: {
    text: string;
    url: string;
  };
}

interface Member {
  _id: string;
  fullName: string;
  email: string;
  organization?: string;
}

const EMAIL_TEMPLATES = {
  event: {
    icon: Calendar,
    title: 'Event Reminder',
    description: 'Remind members about upcoming events',
    defaultSubject: 'Upcoming Event - AWS Cloud Club',
    variables: ['{{EVENT_NAME}}', '{{EVENT_DATE}}', '{{EVENT_TIME}}', '{{EVENT_LOCATION}}', '{{MEMBER_NAME}}'],
    defaultMessage: `Dear {{MEMBER_NAME}},

We hope this message finds you well! We're excited to remind you about our upcoming event:

📅 Event: {{EVENT_NAME}}
📍 Location: {{EVENT_LOCATION}}
🕒 Date & Time: {{EVENT_DATE}} at {{EVENT_TIME}}

This is a fantastic opportunity to learn, network, and grow your cloud computing skills. Don't miss out on this amazing experience!

Please confirm your attendance by replying to this email or visiting our website.

Looking forward to seeing you there!

Best regards,
AWS Cloud Club Team`
  },
  announcement: {
    icon: Megaphone,
    title: 'General Announcement',
    description: 'Share important news and updates',
    defaultSubject: 'Important Announcement - AWS Cloud Club',
    variables: ['{{ANNOUNCEMENT_TITLE}}', '{{ANNOUNCEMENT_DETAILS}}', '{{MEMBER_NAME}}', '{{ACTION_REQUIRED}}'],
    defaultMessage: `Dear {{MEMBER_NAME}},

We have some exciting news to share with you!

🎉 {{ANNOUNCEMENT_TITLE}}

{{ANNOUNCEMENT_DETAILS}}

{{ACTION_REQUIRED}}

Stay tuned for more updates and continue to be part of our amazing cloud community.

Best regards,
AWS Cloud Club Team`
  },
  reminder: {
    icon: Bell,
    title: 'General Reminder',
    description: 'Send general reminders to members',
    defaultSubject: 'Friendly Reminder - AWS Cloud Club',
    variables: ['{{REMINDER_TOPIC}}', '{{DEADLINE_DATE}}', '{{MEMBER_NAME}}', '{{NEXT_STEPS}}'],
    defaultMessage: `Dear {{MEMBER_NAME}},

This is a friendly reminder about: {{REMINDER_TOPIC}}

⏰ Important Deadline: {{DEADLINE_DATE}}

{{NEXT_STEPS}}

Thank you for being an active part of our community! If you have any questions, please don't hesitate to reach out.

Best regards,
AWS Cloud Club Team`
  },
  payment: {
    icon: Users,
    title: 'Payment Reminder',
    description: 'Remind members about pending payments',
    defaultSubject: 'Payment Reminder - AWS Cloud Club Membership',
    variables: ['{{MEMBER_NAME}}', '{{AMOUNT_DUE}}', '{{DUE_DATE}}', '{{PAYMENT_LINK}}'],
    defaultMessage: `Dear {{MEMBER_NAME}},

We hope you're enjoying your AWS Cloud Club membership! This is a friendly reminder about your pending membership payment.

💰 Amount Due: {{AMOUNT_DUE}}
📅 Due Date: {{DUE_DATE}}

To complete your payment, please visit: {{PAYMENT_LINK}}

Your continued membership helps us organize amazing events, workshops, and learning opportunities for our community.

If you have any questions about your payment, please contact us immediately.

Best regards,
AWS Cloud Club Team`
  },
  welcome: {
    icon: UserCheck,
    title: 'Welcome Message',
    description: 'Welcome new members to the club',
    defaultSubject: 'Welcome to AWS Cloud Club! 🎉',
    variables: ['{{MEMBER_NAME}}', '{{NEXT_EVENT}}', '{{DISCORD_LINK}}', '{{RESOURCES_LINK}}'],
    defaultMessage: `Dear {{MEMBER_NAME}},

🎉 Welcome to the AWS Cloud Club! We're thrilled to have you join our amazing community of cloud enthusiasts.

Here's what you can expect as a member:
• Access to exclusive workshops and events
• Networking opportunities with industry professionals
• Hands-on cloud computing projects
• AWS certification preparation resources

🚀 Getting Started:
• Join our Discord community: {{DISCORD_LINK}}
• Check out our learning resources: {{RESOURCES_LINK}}
• Mark your calendar for our next event: {{NEXT_EVENT}}

We're excited to support your cloud journey and can't wait to see what you'll achieve!

Best regards,
AWS Cloud Club Team`
  },
  custom: {
    icon: Mail,
    title: 'Custom Message',
    description: 'Create your own custom email',
    defaultSubject: 'Message from AWS Cloud Club',
    variables: ['{{MEMBER_NAME}}', '{{CUSTOM_CONTENT}}'],
    defaultMessage: `Dear {{MEMBER_NAME}},

{{CUSTOM_CONTENT}}

Best regards,
AWS Cloud Club Team`
  }
};

export default function EmailReminderModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}: EmailReminderModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMAIL_TEMPLATES>('announcement');
  const [formData, setFormData] = useState({
    subject: EMAIL_TEMPLATES.announcement.defaultSubject,
    message: EMAIL_TEMPLATES.announcement.defaultMessage,
    recipientType: 'all' as 'all' | 'multiple' | 'single',
    selectedMembers: [] as string[],
    eventId: '',
    scheduledDate: '',
    customButton: {
      text: '',
      url: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Member selection state
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  
  // Enhanced loading and progress states
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'preparing' | 'sending' | 'success' | 'error'>('idle');
  const [emailsSent, setEmailsSent] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [emailHistory, setEmailHistory] = useState<Array<{
    id: string;
    subject: string;
    template: string;
    recipientCount: number;
    sentAt: Date;
    status: 'sent' | 'failed';
    recipients: string[];
  }>>([]);

  // Fetch members when modal opens
  useEffect(() => {
    if (isOpen && (formData.recipientType === 'multiple' || formData.recipientType === 'single')) {
      fetchMembers();
    }
    if (isOpen) {
      fetchMemberCount();
    }
  }, [isOpen, formData.recipientType]);

  // Filter members based on search and payment status
  useEffect(() => {
    let filtered = members;
    
    // Filter by payment status
    if (memberFilter === 'paid') {
      filtered = filtered.filter(member => member.hasPaid);
    } else if (memberFilter === 'unpaid') {
      filtered = filtered.filter(member => !member.hasPaid);
    }
    
    // Filter by search term
    if (memberSearch.trim()) {
      filtered = filtered.filter(member =>
        (member.name && member.name.toLowerCase().includes(memberSearch.toLowerCase())) ||
        (member.email && member.email.toLowerCase().includes(memberSearch.toLowerCase())) ||
        (member.organization && member.organization.toLowerCase().includes(memberSearch.toLowerCase()))
      );
    }
    
    setFilteredMembers(filtered);
  }, [members, memberSearch, memberFilter]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch('/api/admin/members?limit=1000'); // Fetch more members for selection
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data.members);
      }
    } catch (error) {
        console.error('Error fetching members:', error);
        if ((window as any).toast) {
          (window as any).toast.showError(
            'Failed to Load Members',
            'Unable to fetch member list. Please refresh and try again.'
          );
        }
      } finally {
        setLoadingMembers(false);
      }
  };

  const fetchMemberCount = async () => {
    try {
      const response = await fetch('/api/admin/bulk-email-reminder');
      if (response.ok) {
        const data = await response.json();
        setMemberCount(data.memberCount);
      }
    } catch (error) {
      console.error('Error fetching member count:', error);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => {
      if (prev.recipientType === 'single') {
        return { ...prev, selectedMembers: [memberId] };
      } else {
        const isSelected = prev.selectedMembers.includes(memberId);
        const newSelected = isSelected
          ? prev.selectedMembers.filter(id => id !== memberId)
          : [...prev.selectedMembers, memberId];
        return { ...prev, selectedMembers: newSelected };
      }
    });
  };

  const handleRecipientTypeChange = (type: 'all' | 'multiple' | 'single') => {
    setFormData(prev => ({
      ...prev,
      recipientType: type,
      selectedMembers: []
    }));
    setMemberSearch('');
  };

  const handleTemplateChange = (templateType: keyof typeof EMAIL_TEMPLATES) => {
    setSelectedTemplate(templateType);
    setFormData({
      ...formData,
      subject: EMAIL_TEMPLATES[templateType].defaultSubject,
      message: EMAIL_TEMPLATES[templateType].defaultMessage
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Email subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Email message is required';
    }

    if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    if (formData.recipientType !== 'all' && formData.selectedMembers.length === 0) {
      newErrors.recipients = 'Please select at least one recipient';
    }

    setErrors(newErrors);
    
    // Show validation error toast if there are errors
    if (Object.keys(newErrors).length > 0 && (window as any).toast) {
      const errorMessages = Object.values(newErrors);
      (window as any).toast.showWarning(
        'Please Fix Form Errors',
        errorMessages.join('. ')
      );
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Set initial progress state
      setSendingStatus('preparing');
      setSendingProgress(0);
      
      // Calculate total emails to send
      const totalToSend = formData.recipientType === 'all' 
        ? memberCount 
        : formData.selectedMembers.length;
      setTotalEmails(totalToSend);
      setEmailsSent(0);

      // Simulate progress updates
      setSendingStatus('sending');
      const progressInterval = setInterval(() => {
        setSendingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onSubmit({
        templateType: selectedTemplate,
        subject: formData.subject,
        message: formData.message,
        recipientType: formData.recipientType,
        selectedMembers: formData.selectedMembers,
        eventId: formData.eventId || undefined,
        scheduledDate: formData.scheduledDate || undefined,
        customButton: formData.customButton?.text && formData.customButton?.url ? formData.customButton : undefined
      });

      // Complete progress
      clearInterval(progressInterval);
      setSendingProgress(100);
      setSendingStatus('success');
      setEmailsSent(totalToSend);

      // Record email in history
      const historyEntry = {
        id: Date.now().toString(),
        subject: formData.subject,
        template: selectedTemplate,
        recipientCount: totalToSend,
        sentAt: new Date(),
        status: 'sent' as const,
        recipients: formData.recipientType === 'all' ? ['all members'] : formData.selectedMembers
      };
      setEmailHistory(prev => [historyEntry, ...prev]);
      
      // Show success toast
      if ((window as any).toast) {
        (window as any).toast.showSuccess(
          'Emails Sent Successfully!',
          `Successfully sent ${totalToSend} email${totalToSend !== 1 ? 's' : ''} to ${
            formData.recipientType === 'all' ? 'all members' : 
            formData.recipientType === 'multiple' ? 'selected members' : 'the selected member'
          }.`
        );
      }

      // Show success for 2 seconds before resetting
      setTimeout(() => {
        // Reset form
        setFormData({
          subject: EMAIL_TEMPLATES.announcement.defaultSubject,
          message: EMAIL_TEMPLATES.announcement.defaultMessage,
          recipientType: 'all',
          selectedMembers: [],
          eventId: '',
          scheduledDate: '',
          customButton: {
            text: '',
            url: ''
          }
        });
        setSelectedTemplate('announcement');
        setErrors({});
        setMemberSearch('');
        setSendingStatus('idle');
        setSendingProgress(0);
        setEmailsSent(0);
        setTotalEmails(0);
        onClose(); // Close modal after successful send
      }, 2000);

    } catch (error) {
      console.error('Error sending email:', error);
      setSendingStatus('error');
      setSendingProgress(0);
      
      // Record failed email in history
      const historyEntry = {
        id: Date.now().toString(),
        subject: formData.subject,
        template: selectedTemplate,
        recipientCount: totalToSend,
        sentAt: new Date(),
        status: 'failed' as const,
        recipients: formData.recipientType === 'all' ? ['all members'] : formData.selectedMembers
      };
      setEmailHistory(prev => [historyEntry, ...prev]);
      
      // Show error toast
      if ((window as any).toast) {
        (window as any).toast.showError(
          'Failed to Send Emails',
          error instanceof Error ? error.message : 'An unexpected error occurred while sending emails. Please try again.'
        );
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Bulk action functions
  const selectAllMembers = () => {
    const memberIds = filteredMembers.map(member => member._id);
    setFormData(prev => ({ ...prev, selectedMembers: memberIds }));
  };

  const selectNoneMembers = () => {
    setFormData(prev => ({ ...prev, selectedMembers: [] }));
  };

  const selectPaidMembers = () => {
    const paidMemberIds = filteredMembers.filter(member => member.hasPaid).map(member => member._id);
    setFormData(prev => ({ ...prev, selectedMembers: paidMemberIds }));
  };

  const selectUnpaidMembers = () => {
    const unpaidMemberIds = filteredMembers.filter(member => !member.hasPaid).map(member => member._id);
    setFormData(prev => ({ ...prev, selectedMembers: unpaidMemberIds }));
  };

  // Template variable functions
  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentMessage = formData.message;
      const newMessage = currentMessage.substring(0, start) + variable + currentMessage.substring(end);
      setFormData(prev => ({ ...prev, message: newMessage }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  // Rich text formatting functions
  // Store selection state to preserve it across button clicks
  const [selectionState, setSelectionState] = useState<{start: number, end: number, text: string} | null>(null);

  const handleFormatButtonMouseDown = (e: React.MouseEvent, format: string) => {
    e.preventDefault(); // Prevent button from taking focus
    const textarea = document.querySelector('#message') as HTMLTextAreaElement;
    if (textarea) {
      // Store current selection
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      setSelectionState({ start, end, text: selectedText });
      
      // Apply formatting immediately
      insertFormatting(format, { start, end, selectedText, currentMessage: textarea.value });
    }
  };

  const insertFormatting = (format: string, selectionData?: {start: number, end: number, selectedText: string, currentMessage: string}) => {
    const textarea = document.querySelector('#message') as HTMLTextAreaElement;
    if (!textarea) return;
    
    // Use provided selection data or get current selection
    const start = selectionData?.start ?? textarea.selectionStart;
    const end = selectionData?.end ?? textarea.selectionEnd;
    const selectedText = selectionData?.selectedText ?? textarea.value.substring(start, end);
    const currentMessage = selectionData?.currentMessage ?? textarea.value;
    
    let formattedText = '';
    let newCursorPos = start;
    
    switch (format) {
      case 'bold':
        if (selectedText) {
          formattedText = `**${selectedText}**`;
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '**bold text**';
          newCursorPos = start + 2; // Position cursor between the asterisks
        }
        break;
      case 'italic':
        if (selectedText) {
          formattedText = `*${selectedText}*`;
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '*italic text*';
          newCursorPos = start + 1; // Position cursor between the asterisks
        }
        break;
      case 'list':
        if (selectedText) {
          // Handle multiple lines
          const lines = selectedText.split('\n');
          formattedText = lines.map(line => line.trim() ? `• ${line}` : '').join('\n');
          if (!formattedText.startsWith('\n') && start > 0 && currentMessage[start - 1] !== '\n') {
            formattedText = '\n' + formattedText;
          }
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = start === 0 || currentMessage[start - 1] === '\n' ? '• List item' : '\n• List item';
          newCursorPos = start + formattedText.length;
        }
        break;
      case 'numberedList':
        if (selectedText) {
          // Handle multiple lines
          const lines = selectedText.split('\n');
          formattedText = lines.map((line, index) => line.trim() ? `${index + 1}. ${line}` : '').join('\n');
          if (!formattedText.startsWith('\n') && start > 0 && currentMessage[start - 1] !== '\n') {
            formattedText = '\n' + formattedText;
          }
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = start === 0 || currentMessage[start - 1] === '\n' ? '1. Numbered item' : '\n1. Numbered item';
          newCursorPos = start + formattedText.length;
        }
        break;
      default:
        formattedText = selectedText;
        newCursorPos = start + formattedText.length;
    }
    
    const newMessage = currentMessage.substring(0, start) + formattedText + currentMessage.substring(end);
    
    // Update the state (React will handle updating the textarea value)
    setFormData(prev => ({ ...prev, message: newMessage }));
    
    // Restore cursor position and focus after React updates
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertCustomButton = () => {
    if (formData.customButton?.text && formData.customButton?.url) {
      const buttonText = `\n\n[${formData.customButton.text}](${formData.customButton.url})\n\n`;
      const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const currentMessage = formData.message;
        const newMessage = currentMessage.substring(0, start) + buttonText + currentMessage.substring(start);
        setFormData(prev => ({ ...prev, message: newMessage }));
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + buttonText.length, start + buttonText.length);
        }, 0);
      }
    }
  };

  const processTemplateVariables = (message: string, memberName?: string) => {
    let processedMessage = message;
    
    // Replace member name
    if (memberName) {
      processedMessage = processedMessage.replace(/\{\{MEMBER_NAME\}\}/g, memberName);
    }
    
    // Replace custom variables
    Object.entries(templateVariables).forEach(([key, value]) => {
      const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedMessage = processedMessage.replace(variablePattern, value);
    });
    
    return processedMessage;
  };

  const generateEmailPreview = () => {
    const template = EMAIL_TEMPLATES[selectedTemplate];
    const processedSubject = processTemplateVariables(formData.subject, 'John Doe');
    let processedMessage = processTemplateVariables(formData.message, 'John Doe');
    
    // Process rich text formatting
    processedMessage = processedMessage
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/^- (.+)$/gm, '<li>$1</li>') // Bullet points
      .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>') // Numbered lists
      .replace(/(<li>.*<\/li>)/gs, '<ul style="margin: 10px 0; padding-left: 20px;">$1</ul>'); // Wrap lists
    
    // Template-specific styling and icons - All using announcement template colors
    const templateConfig = {
      event: {
        color: '#7C4DFF',
        icon: '📅',
        bgGradient: 'linear-gradient(to right, #9B6DFF, #7C4DFF)'
      },
      announcement: {
        color: '#7C4DFF',
        icon: '📢',
        bgGradient: 'linear-gradient(to right, #9B6DFF, #7C4DFF)'
      },
      reminder: {
        color: '#7C4DFF',
        icon: '🔔',
        bgGradient: 'linear-gradient(to right, #9B6DFF, #7C4DFF)'
      },
      custom: {
        color: '#7C4DFF',
        icon: '✉️',
        bgGradient: 'linear-gradient(to right, #9B6DFF, #7C4DFF)'
      }
    };

    const config = templateConfig[selectedTemplate as keyof typeof templateConfig] || templateConfig.custom;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${processedSubject}</title>
        <style>
          /* Base styles */
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .preview-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .header {
            background: ${config.bgGradient};
            padding: 30px 20px;
            text-align: center;
            color: white;
            border-radius: 10px 10px 0 0;
            position: relative;
          }
          .template-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
          }
          h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 30px 25px;
            background-color: #ffffff;
          }
          .message-content {
            background-color: #f8f9fa;
            border-left: 4px solid ${config.color};
            padding: 20px;
            margin: 25px 0;
            border-radius: 6px;
            white-space: pre-line;
            font-size: 16px;
            line-height: 1.7;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: ${config.bgGradient};
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
          }
          .contact {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 2px solid #f0f0f0;
            background-color: #fafafa;
            padding: 25px;
            border-radius: 8px;
          }
          .contact h3 {
            color: ${config.color};
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .contact p {
            margin: 8px 0;
            font-size: 15px;
          }
          .contact a {
            color: ${config.color};
            text-decoration: none;
            font-weight: 500;
          }
          .footer {
            background: linear-gradient(135deg, #9B6DFF 0%, #7C4DFF 100%);
            padding: 25px;
            text-align: center;
            font-size: 14px;
            color: white;
            border-radius: 0 0 10px 10px;
            margin-top: 0;
          }
          .footer p {
            margin: 8px 0;
            opacity: 0.9;
          }
          @media only screen and (max-width: 600px) {
            .container {
              width: 100%;
              margin: 10px;
              padding: 10px;
            }
            .header {
              padding: 20px 15px;
            }
            .content {
              padding: 20px 15px;
            }
            h1 {
              font-size: 24px;
            }
            .template-icon {
              font-size: 36px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="preview-note">
            📧 <strong>Email Preview</strong> - This shows how your email will look with template variables processed. Member names will be personalized for each recipient.
          </div>
          <div class="header">
             <img src="https://awscc.tn/images/awscc-logo.jpg" alt="AWS Cloud Club ISIMS" class="logo" style="width: 80px; height: 80px; margin-bottom: 15px; border-radius: 10px;">
             <h1>AWS Cloud Club ISIMS</h1>
           </div>
          
          <div class="content">
            <div class="message-content">
              ${processedMessage}
            </div>
            
            <p style="text-align: center;">
              ${formData.customButton?.text && formData.customButton?.url 
                ? `<a href="${formData.customButton.url}" class="button">${formData.customButton.text}</a>`
                : `<a href="https://awscc.tn" class="button">Visit Our Website</a>`
              }
            </p>
            
            <div class="contact">
              <h3>Need Assistance?</h3>
              <p>If you have any questions or need support, please don't hesitate to contact us:</p>
              <p><strong>Email:</strong> <a href="mailto:awscloudclubisims@gmail.com">awscloudclubisims@gmail.com</a></p>
              <p><strong>Website:</strong> <a href="https://awscc.tn">awscc.tn</a></p>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
            <p>This email was sent to you as a member of AWS Cloud Club ISIMS.</p>
            <p>You received this email from our admin panel notification system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    setPreviewHtml(html);
    setShowPreview(true);
    
    // Show info toast about preview
    if ((window as any).toast) {
      (window as any).toast.showInfo(
        'Email Preview Ready',
        'Review your email content and click "Send Email" when ready. Template variables are shown with sample data.'
      );
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
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary to-[#7C4DFF]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {formData.recipientType === 'all' 
                ? 'Send Email to All Members'
                : formData.recipientType === 'multiple'
                ? 'Send Email to Multiple Members'
                : 'Send Email to Single Member'
              }
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
              disabled={loading}
            >
              <Calendar className="h-4 w-4" />
              <span>History ({emailHistory.length})</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-card">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Email Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={key}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === key
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-[#7C4DFF]/10 shadow-lg'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleTemplateChange(key as keyof typeof EMAIL_TEMPLATES)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedTemplate === key 
                          ? 'bg-gradient-to-br from-primary to-[#7C4DFF] text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          selectedTemplate === key ? 'text-primary' : 'text-foreground'
                        }`}>
                          {template.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
              Email Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
                errors.subject ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Enter email subject"
              disabled={loading}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Email Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Email Message *
            </label>
            
            {/* Rich Text Formatting Toolbar */}
            <div className="mb-3 p-3 bg-muted/30 border border-border rounded-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground mr-2">Formatting:</span>
                
                <button
                  type="button"
                  onMouseDown={(e) => handleFormatButtonMouseDown(e, 'bold')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Bold text"
                >
                  <Bold className="h-4 w-4" />
                  Bold
                </button>
                
                <button
                  type="button"
                  onMouseDown={(e) => handleFormatButtonMouseDown(e, 'italic')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Italic text"
                >
                  <Italic className="h-4 w-4" />
                  Italic
                </button>
                
                <button
                  type="button"
                  onMouseDown={(e) => handleFormatButtonMouseDown(e, 'list')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Bullet list"
                >
                  <List className="h-4 w-4" />
                  List
                </button>
                
                <button
                  type="button"
                  onMouseDown={(e) => handleFormatButtonMouseDown(e, 'numberedList')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Numbered list"
                >
                  <span className="text-xs font-bold">1.</span>
                  Numbered
                </button>
                
                <div className="h-6 w-px bg-border mx-2"></div>
                
                <button
                  type="button"
                  onClick={insertCustomButton}
                  disabled={!formData.customButton?.text || !formData.customButton?.url}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Insert custom button"
                >
                  <Plus className="h-4 w-4" />
                  Insert Button
                </button>
              </div>
              
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>Tip:</strong> Select text and click formatting buttons to apply styles. Use **bold** and *italic* markdown syntax.
              </div>
            </div>
            
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={12}
              className={`w-full px-4 py-3 border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none ${
                errors.message ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Enter your email message"
              disabled={loading}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.message}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              Character count: {formData.message.length}
            </p>
            
            {/* Custom Button Configuration */}
            <div className="mt-4 p-4 bg-muted/30 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Link className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Custom Button (Optional)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="buttonText" className="block text-xs font-medium text-foreground mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    id="buttonText"
                    value={formData.customButton?.text || ''}
                    onChange={(e) => handleInputChange('customButton', { ...(formData.customButton || { text: '', url: '' }), text: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="e.g., Register Now, Learn More"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label htmlFor="buttonUrl" className="block text-xs font-medium text-foreground mb-1">
                    Button URL
                  </label>
                  <input
                    type="url"
                    id="buttonUrl"
                    value={formData.customButton?.url || ''}
                    onChange={(e) => handleInputChange('customButton', { ...(formData.customButton || { text: '', url: '' }), url: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="https://example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                Add a custom button to your email. Both text and URL are required to insert the button.
              </div>
            </div>
            
            {/* Template Variables */}
            {EMAIL_TEMPLATES[selectedTemplate].variables && EMAIL_TEMPLATES[selectedTemplate].variables.length > 0 && (
              <div className="mt-3 p-4 bg-muted/50 border border-border rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Template Variables</span>
                  <button
                    type="button"
                    onClick={() => setShowVariables(!showVariables)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {showVariables ? 'Hide' : 'Show'} Variables
                  </button>
                </div>
                
                {showVariables && (
                  <div className="space-y-3">
                    {/* Quick Insert Variables */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Click to insert:</p>
                      <div className="flex flex-wrap gap-2">
                        {EMAIL_TEMPLATES[selectedTemplate].variables.map((variable) => (
                          <button
                            key={variable}
                            type="button"
                            onClick={() => insertVariable(variable)}
                            className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            {variable}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Custom Variable Values */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Customize variable values:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {EMAIL_TEMPLATES[selectedTemplate].variables
                          .filter(variable => variable !== '{{MEMBER_NAME}}') // Member name is auto-filled
                          .map((variable) => {
                            const cleanVar = variable.replace(/[{}]/g, '');
                            return (
                              <div key={variable} className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground min-w-0 flex-shrink-0 font-medium">
                                  {cleanVar}:
                                </span>
                                <input
                                  type="text"
                                  value={templateVariables[cleanVar] || ''}
                                  onChange={(e) => setTemplateVariables(prev => ({
                                    ...prev,
                                    [cleanVar]: e.target.value
                                  }))}
                                  className="text-xs border border-border bg-background text-foreground rounded-lg px-3 py-1.5 flex-1 min-w-0 focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                  placeholder={`Enter ${cleanVar.toLowerCase()}`}
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recipient Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Select Recipients *
            </label>
            
            {/* Recipient Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRecipientTypeChange('all')}
                className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                  formData.recipientType === 'all'
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-[#7C4DFF]/10 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    formData.recipientType === 'all' 
                      ? 'bg-gradient-to-br from-primary to-[#7C4DFF] text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <span className={`font-medium ${
                    formData.recipientType === 'all' ? 'text-primary' : 'text-foreground'
                  }`}>
                    All Members
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-11">
                  Send to all {memberCount} members
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRecipientTypeChange('multiple')}
                className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                  formData.recipientType === 'multiple'
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-[#7C4DFF]/10 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    formData.recipientType === 'multiple' 
                      ? 'bg-gradient-to-br from-primary to-[#7C4DFF] text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <span className={`font-medium ${
                    formData.recipientType === 'multiple' ? 'text-primary' : 'text-foreground'
                  }`}>
                    Multiple Members
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-11">
                  Select specific members
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRecipientTypeChange('single')}
                className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                  formData.recipientType === 'single'
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-[#7C4DFF]/10 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    formData.recipientType === 'single' 
                      ? 'bg-gradient-to-br from-primary to-[#7C4DFF] text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <UserX className="h-4 w-4" />
                  </div>
                  <span className={`font-medium ${
                    formData.recipientType === 'single' ? 'text-primary' : 'text-foreground'
                  }`}>
                    Single Member
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-11">
                  Send to one member
                </p>
              </button>
            </div>

            {/* Member Selection Interface */}
            {(formData.recipientType === 'multiple' || formData.recipientType === 'single') && (
              <div className="border border-border bg-card rounded-xl p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search members by name, email, or organization..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* Filter and Bulk Actions */}
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  {/* Payment Status Filter */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                    <select
                      value={memberFilter}
                      onChange={(e) => setMemberFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Members</option>
                      <option value="paid">Paid Members</option>
                      <option value="unpaid">Unpaid Members</option>
                    </select>
                  </div>

                  {/* Bulk Actions */}
                  {formData.recipientType === 'multiple' && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Bulk Actions
                      </button>
                      {showBulkActions && (
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={selectAllMembers}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={selectNoneMembers}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            None
                          </button>
                          <button
                            type="button"
                            onClick={selectPaidMembers}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Paid
                          </button>
                          <button
                            type="button"
                            onClick={selectUnpaidMembers}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                          >
                            Unpaid
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Count */}
                {formData.selectedMembers.length > 0 && (
                  <div className="text-sm text-blue-600 font-medium">
                    {formData.selectedMembers.length} member{formData.selectedMembers.length !== 1 ? 's' : ''} selected
                  </div>
                )}

                {/* Member List */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {loadingMembers ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading members...</p>
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {memberSearch ? 'No members found matching your search.' : 'No members available.'}
                    </p>
                  ) : (
                    filteredMembers.map((member) => (
                      <div
                        key={member._id}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.selectedMembers.includes(member._id)
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleMemberToggle(member._id)}
                      >
                        <input
                          type={formData.recipientType === 'single' ? 'radio' : 'checkbox'}
                          checked={formData.selectedMembers.includes(member._id)}
                          onChange={() => handleMemberToggle(member._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.fullName}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              member.hasPaid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.hasPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {member.email}
                          </p>
                          {member.organization && (
                            <p className="text-xs text-gray-400 truncate">
                              {member.organization}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Recipients Summary */}
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {formData.recipientType === 'all' 
                    ? `Email will be sent to all ${memberCount} members`
                    : formData.recipientType === 'multiple'
                    ? `Email will be sent to ${formData.selectedMembers.length} selected member${formData.selectedMembers.length !== 1 ? 's' : ''}`
                    : formData.selectedMembers.length === 1
                    ? 'Email will be sent to 1 selected member'
                    : 'Please select a member'
                  }
                </span>
              </div>
            </div>

            {errors.recipients && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.recipients}
              </p>
            )}
          </div>

          {/* Progress Indicator */}
          {sendingStatus !== 'idle' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {sendingStatus === 'preparing' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Preparing to send...</span>
                    </>
                  )}
                  {sendingStatus === 'sending' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Sending emails...</span>
                    </>
                  )}
                  {sendingStatus === 'success' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Successfully sent!</span>
                    </>
                  )}
                  {sendingStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Failed to send</span>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {emailsSent}/{totalEmails} emails
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    sendingStatus === 'success' ? 'bg-green-500' : 
                    sendingStatus === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${sendingProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={generateEmailPreview}
              className="px-4 py-2 text-primary bg-secondary hover:bg-secondary/80 rounded-lg transition-colors flex items-center space-x-2"
              disabled={loading || sendingStatus !== 'idle'}
            >
              <Eye className="h-4 w-4" />
              <span>Preview Email</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                disabled={loading || sendingStatus === 'sending'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || sendingStatus === 'sending'}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingStatus === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : sendingStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Sent Successfully!</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>
                      {formData.recipientType === 'all' 
                        ? `Send Email to All Members (${memberCount})`
                        : formData.recipientType === 'multiple'
                        ? `Send Email to ${formData.selectedMembers.length} Member${formData.selectedMembers.length !== 1 ? 's' : ''}`
                        : formData.selectedMembers.length === 1
                        ? 'Send Email to Selected Member'
                        : 'Send Email'
                      }
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Email Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-sm text-primary font-medium">
                  <strong>Subject:</strong> {formData.subject}
                </p>
                <p className="text-sm text-primary/80 mt-1">
                  <strong>Recipients:</strong> {' '}
                  {formData.recipientType === 'all' 
                    ? `All ${memberCount} members`
                    : formData.recipientType === 'multiple'
                    ? `${formData.selectedMembers.length} selected members`
                    : '1 selected member'
                  }
                </p>
              </div>

              {/* Email HTML Preview */}
              <div className="border border-border rounded-xl overflow-hidden">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-96 border-0"
                  title="Email Preview"
                />
              </div>
            </div>

            {/* Preview Footer */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-border bg-muted/30">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-foreground bg-background border border-border hover:bg-muted rounded-xl transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  // Trigger form submission
                  const form = document.querySelector('form');
                  if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-primary to-[#7C4DFF] hover:from-primary/90 hover:to-[#7C4DFF]/90 text-white rounded-xl transition-all flex items-center space-x-2 shadow-lg"
              >
                <Send className="h-4 w-4" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email History Section */}
      {showHistory && (
        <div className="border-t border-border bg-muted/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-primary to-[#7C4DFF] text-white rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <span>Email History</span>
              </h3>
              <div className="text-sm text-muted-foreground bg-background px-3 py-1 rounded-lg border border-border">
                {emailHistory.length} email{emailHistory.length !== 1 ? 's' : ''} sent
              </div>
            </div>

            {emailHistory.length === 0 ? (
              <div className="text-center py-8 bg-card rounded-xl border border-border">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground">No emails sent yet</p>
                <p className="text-sm text-muted-foreground">Your email history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {emailHistory.map((email) => (
                  <div key={email.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-foreground">{email.subject}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            email.status === 'sent' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {email.status === 'sent' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Sent
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Failed
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{email.recipientCount} recipient{email.recipientCount !== 1 ? 's' : ''}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Megaphone className="h-4 w-4" />
                            <span>{EMAIL_TEMPLATES[email.template]?.title || email.template}</span>
                          </span>
                          <span>{email.sentAt.toLocaleDateString()} at {email.sentAt.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics Summary */}
            {emailHistory.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-primary">
                    {emailHistory.filter(e => e.status === 'sent').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-destructive">
                    {emailHistory.filter(e => e.status === 'failed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-green-600">
                    {emailHistory.reduce((sum, e) => sum + (e.status === 'sent' ? e.recipientCount : 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Sent</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}