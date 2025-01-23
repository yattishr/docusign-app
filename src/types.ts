import { z } from "zod"

export interface SyncResponse {
    syncUpdatedToken: string;
    syncDeletedToken: string;
    ready: boolean;
}

export interface SyncUpdatedResponse {
    nextPageToken?: string;
    nextDeltaToken: string;
    records: EmailMessage[];
}

export const emailAddressSchema = z.object({
    name: z.string(),
    address: z.string()
})

export interface EmailAddress {
    name?: string;
    address: string;
    raw?: string;
}

export interface EmailAttachment {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    inline: boolean;    
    contentId: string;
    content: string;
    contentLocation?: string;
}

export interface EmailHeader {
    name: string;
    value: string;
}

export interface EmailMessage {
    id: string;
    threadId: string;
    createdTime: string;
    lastModifiedTime: string;
    sentAt: string;
    receivedAt: string;
    internetMessageId: string;
    subject: string;
    sysLabels: Array<"junk" | "trash" | "sent" | "inbox" | "unread" | "flagged" | "important" | "draft">;
    keywords: string;
    sysClassifications: Array<"personal" | "social" | "promotions" | "updates" | "forums">;
    sensitivity: "normal" | "private" | "confidential";
    meetingMessageMethod?: "request" | "reply" | "cancel" | "counter" | "other";
    from: EmailAddress;
    to: EmailAddress[];
    cc: EmailAddress[];
    bcc: EmailAddress[];
    replyTo: EmailAddress[];
    hasAttachments: boolean;
    body?: string;
    bodySnippet?: string;
    attachments: EmailAttachment[];
    inReplyTo?: string;
    references?: string;
    threadIndex: string;
    internetHeaders: EmailHeader[];
    nativeProperties: Record<string, string>;
    folderId?: string;
    ommitted: Array<"threadId" | "body" | "attachments" | "recipients" | "internetHeaders">;
}

export interface TextTab {
    tabLabel: string;
    value: string;
}

export interface Tabs {
    textTabs: TextTab[];
}

export interface TemplateRoles {
    email: string;
    name: string;
    roleName: string
    tabs: Tabs;
}

export interface RecipientDetails {
    email: string;
    name: string;
}

export interface FieldValues {
    projectName: string;
    startDate: string;
    companyName: string;
    receivingReason: string;
    projectDuration: string;    
}

export interface Template {
  templateId: string;
  name: string;
  // Add other properties as needed
}

export interface TemplatesResponse {
  envelopeTemplates: Template[];
  resultSetSize: string;
  startPosition: string;
  endPosition: string;
  totalSetSize: string;
}