import FileSaver from 'file-saver';
import { surpriseMePrompts } from '../constants';

export function getRandomPrompt(current) {
  let prompt;
  do {
    prompt = surpriseMePrompts[Math.floor(Math.random() * surpriseMePrompts.length)];
  } while (prompt === current);
  return prompt;
}

export async function downloadImage(id, photoUrl) {
  try {
    const response = await fetch(photoUrl);
    const blob = await response.blob();
    FileSaver.saveAs(blob, `artzy-ai-${id}.jpg`);
  } catch {
    FileSaver.saveAs(photoUrl, `artzy-ai-${id}.jpg`);
  }
}

export function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function formatResetDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
