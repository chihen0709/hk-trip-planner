import { firebaseConfig } from '../firebase';

function toFirestoreValue(value) {
  if (Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === 'number') return { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  return { stringValue: String(value ?? '') };
}

function toFirestoreFields(data) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, toFirestoreValue(value)])
  );
}

export async function createFirestoreDocument(collectionName, documentId, data, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
  const url = `${baseUrl}/${collectionName}?documentId=${encodeURIComponent(documentId)}&key=${firebaseConfig.apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      const error = new Error(`Firestore REST create failed: ${response.status}`);
      error.status = response.status;
      error.detail = detail;
      throw error;
    }
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function deleteFirestoreDocument(collectionName, documentId, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
  const url = `${baseUrl}/${collectionName}/${encodeURIComponent(documentId)}?key=${firebaseConfig.apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      signal: controller.signal,
    });

    if (!response.ok && response.status !== 404) {
      const detail = await response.text();
      const error = new Error(`Firestore REST delete failed: ${response.status}`);
      error.status = response.status;
      error.detail = detail;
      throw error;
    }
  } finally {
    window.clearTimeout(timeoutId);
  }
}
