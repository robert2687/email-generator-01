
export type EmailStyle = 'Formal' | 'Friendly' | 'Concise' | 'Professional' | 'Administrative';

export interface EmailRequestData {
  prompt: string;
  style: EmailStyle;
  useSearch: boolean;
}

export interface GeneratedEmailContent {
  id?: string; // Optional: for items in history
  timestamp?: number; // Optional: for items in history
  subject: string;
  body: string;
  sources?: {
    uri: string;
    title: string;
  }[];
}

export type TranscriptEntry = {
  speaker: 'user' | 'model';
  text: string;
};
