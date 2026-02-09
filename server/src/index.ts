import express from 'express';
import cors from 'cors';
import editRouter from './routes/edit.js';
import versionsRouter from './routes/versions.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', editRouter);
app.use('/api', versionsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
