import { Router } from 'express';
import {
  listVersions,
  getVersionContent,
  saveVersion,
  clearVersions,
} from '../services/versionService.js';

const router = Router();

// List all versions (metadata only)
router.get('/versions', async (_req, res) => {
  const versions = await listVersions();
  res.json(versions);
});

// Get a single version's content
router.get('/versions/:id', async (req, res) => {
  const content = await getVersionContent(req.params.id);
  if (content === null) {
    res.status(404).json({ error: 'Version not found' });
    return;
  }
  res.json({ content });
});

// Save current content as a new version
router.post('/versions', async (req, res) => {
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'Missing content' });
    return;
  }
  const entry = await saveVersion(content);
  if (!entry) {
    res.status(200).json({ duplicate: true });
    return;
  }
  res.status(201).json(entry);
});

// Clear all versions
router.delete('/versions', async (_req, res) => {
  await clearVersions();
  res.json({ ok: true });
});

export default router;
