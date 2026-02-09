import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const VERSIONS_DIR = path.resolve(import.meta.dirname, '../../../versions');
const MANIFEST_PATH = path.join(VERSIONS_DIR, 'manifest.json');

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

interface VersionMeta {
  id: string;
  label: string;
  timestamp: number;
  filename: string;
  hash: string;
}

async function ensureDir() {
  if (!existsSync(VERSIONS_DIR)) {
    await mkdir(VERSIONS_DIR, { recursive: true });
  }
}

async function readManifest(): Promise<VersionMeta[]> {
  await ensureDir();
  if (!existsSync(MANIFEST_PATH)) return [];
  const raw = await readFile(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeManifest(manifest: VersionMeta[]) {
  await ensureDir();
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

export async function listVersions(): Promise<Omit<VersionMeta, 'filename'>[]> {
  const manifest = await readManifest();
  return manifest.map(({ id, label, timestamp, hash }) => ({ id, label, timestamp, hash }));
}

export async function getVersionContent(id: string): Promise<string | null> {
  const manifest = await readManifest();
  const entry = manifest.find(v => v.id === id);
  if (!entry) return null;
  const filePath = path.join(VERSIONS_DIR, entry.filename);
  if (!existsSync(filePath)) return null;
  return readFile(filePath, 'utf-8');
}

export async function saveVersion(content: string): Promise<VersionMeta | null> {
  const manifest = await readManifest();

  // Deduplicate: check if latest version has same content
  if (manifest.length > 0) {
    const latest = manifest[manifest.length - 1];
    const latestPath = path.join(VERSIONS_DIR, latest.filename);
    if (existsSync(latestPath)) {
      const latestContent = await readFile(latestPath, 'utf-8');
      if (latestContent === content) return null;
    }
  }

  const id = crypto.randomUUID();
  const number = manifest.length + 1;
  const filename = `v${number}-${id.slice(0, 8)}.md`;

  const entry: VersionMeta = {
    id,
    label: `Version ${number}`,
    timestamp: Date.now(),
    filename,
    hash: hashContent(content),
  };

  await writeFile(path.join(VERSIONS_DIR, filename), content, 'utf-8');
  manifest.push(entry);
  await writeManifest(manifest);

  return entry;
}

export async function clearVersions() {
  const manifest = await readManifest();
  for (const entry of manifest) {
    const filePath = path.join(VERSIONS_DIR, entry.filename);
    if (existsSync(filePath)) {
      await rm(filePath);
    }
  }
  await writeManifest([]);
}
