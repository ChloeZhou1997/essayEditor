import { Router } from 'express';
import { buildPrompt, buildChatPrompt } from '../utils/promptBuilder.js';
import { streamClaudeEdit, streamClaudeChat } from '../services/claudeService.js';

const router = Router();

router.post('/edit', async (req, res) => {
  const { fullContent, editLevel, model, mode, instruction, targets, history } = req.body;

  if (!fullContent) {
    res.status(400).json({ error: 'Missing required field: fullContent' });
    return;
  }

  if (mode !== 'chat') {
    if (!editLevel) {
      res.status(400).json({ error: 'Missing required field: editLevel' });
      return;
    }
    if (editLevel === 'whole' && !instruction) {
      res.status(400).json({ error: 'Missing instruction for whole-document editing' });
      return;
    }
    if ((editLevel === 'section' || editLevel === 'selection') && (!targets || targets.length === 0)) {
      res.status(400).json({ error: 'Missing targets for section/selection editing' });
      return;
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = mode === 'chat'
      ? streamClaudeChat(buildChatPrompt(fullContent, instruction || '', history), model)
      : streamClaudeEdit(buildPrompt({ fullContent, editLevel, instruction, targets }), model);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done', data: '' })}\n\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.write(`data: ${JSON.stringify({ type: 'error', data: message })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;
