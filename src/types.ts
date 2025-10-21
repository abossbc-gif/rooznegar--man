export interface RecordingEntry {
  id: string;
  createdAt: string;
  duration: number; // in seconds
  transcript: string;
  tags: string[];
}