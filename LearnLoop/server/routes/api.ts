import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { db, Document, Topic, LearningObjective } from '../db/database.js';
import { aiService } from '../ai/service.js';

const router = express.Router();

// Fallback PDF text stream extractor in case pdf-parse encounters unusual xref or version flags
function extractRawTextFromPdfBuffer(buf: Buffer): string {
  try {
    const str = buf.toString('latin1');
    const matches: string[] = [];
    const regex = /\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      const clean = match[1].replace(/\\([()\\])/g, '$1').trim();
      // Keep words/sentences with alphabetic characters
      if (clean.length > 2 && /[a-zA-Z]/.test(clean)) {
        matches.push(clean);
      }
    }
    return matches.join(' ');
  } catch {
    return '';
  }
}

// Configure Multer for PDF upload in memory with 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are supported. Please upload a .pdf file.'));
    }
  },
});

// Safe Multer wrapper middleware to prevent uncaught HTML errors
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload error. Please ensure you upload a valid PDF under 10MB.',
      });
    }
    next();
  });
};

// ----------------------------------------------------
// 1. Dashboard Overview
// ----------------------------------------------------
router.get('/dashboard', (_req: Request, res: Response) => {
  try {
    const activeDoc = db.getActiveDocument();
    const topics = db.getTopics(activeDoc?.id);
    const stats = db.getUserStats();
    const documents = db.getDocuments();
    const revisions = db.getRevisions('pending');

    const totalTopics = topics.length;
    const masteredTopics = topics.filter((t) => t.status === 'mastered').length;
    const progressPercent = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

    const todayPlan = aiService.generateTodayPlan(topics);

    // Format upcoming reviews with friendly relative days
    const today = new Date().toISOString().split('T')[0];
    const formattedRevisions = revisions.map((rev) => {
      const dueDate = new Date(rev.due_date);
      const now = new Date(today);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      let relativeLabel = '';
      if (diffDays <= 0) relativeLabel = 'Today';
      else if (diffDays === 1) relativeLabel = 'Tomorrow';
      else relativeLabel = `In ${diffDays} days`;

      return {
        ...rev,
        relativeLabel,
      };
    });

    // Populate topics with learning objectives
    const topicsWithObjectives = topics.map((t) => ({
      ...t,
      objectives: db.getObjectivesForTopic(t.id),
      attemptsCount: db.getFeynmanAttempts(t.id).length,
    }));

    res.json({
      success: true,
      stats: {
        ...stats,
        total_topics: totalTopics,
        mastered_topics: masteredTopics,
        progress_percent: progressPercent,
      },
      todayPlan,
      topics: topicsWithObjectives,
      activeDocument: activeDoc || documents[0] || null,
      allDocuments: documents.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        topicsCount: db.getTopics(d.id).length,
        isActive: d.id === (activeDoc?.id || ''),
      })),
      upcomingReviews: formattedRevisions,
    });
  } catch (err: any) {
    console.error('Error fetching dashboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. Documents & PDF Upload / Ingestion
// ----------------------------------------------------
router.get('/documents', (_req: Request, res: Response) => {
  try {
    const docs = db.getDocuments();
    const activeId = db.getActiveDocumentId();
    res.json({
      success: true,
      documents: docs.map((d) => ({
        ...d,
        topicsCount: db.getTopics(d.id).length,
        isActive: d.id === activeId,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/documents/select/:id', (req: Request, res: Response) => {
  try {
    const doc = db.getDocument(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    db.setActiveDocumentId(doc.id);
    res.json({ success: true, activeDocument: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/documents/upload', uploadMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded. Please select a PDF.' });
    }

    // Step 1: Extract text from PDF buffer
    let rawText = '';
    try {
      let parseFunc = pdfParse;
      if (typeof parseFunc !== 'function' && (pdfParse as any)?.default) {
        parseFunc = (pdfParse as any).default;
      }
      const pdfData = await (parseFunc as any)(req.file.buffer);
      rawText = (pdfData.text || '').trim();
    } catch (parseErr: any) {
      console.warn('pdf-parse threw error, attempting regex stream extraction:', parseErr.message);
      rawText = extractRawTextFromPdfBuffer(req.file.buffer).trim();
    }

    if (!rawText || rawText.length < 30) {
      const streamFallback = extractRawTextFromPdfBuffer(req.file.buffer).trim();
      if (streamFallback.length > rawText.length) {
        rawText = streamFallback;
      }
    }

    if (!rawText || rawText.length < 30) {
      return res.status(422).json({
        success: false,
        error:
          'Could not extract text from this PDF. It may be image-only (scanned), empty, or encrypted. Please try a text-based PDF or paste your study notes directly.',
      });
    }

    // Step 2: AI Document Analysis & Topic Map Generation
    const analysis = await aiService.analyseDocument(rawText, req.file.originalname);

    const docId = `doc-${Date.now()}`;
    const newDoc: Document = {
      id: docId,
      title: analysis.title || req.file.originalname.replace('.pdf', ''),
      description: analysis.description || 'Uploaded study document.',
      raw_text_preview: rawText.slice(0, 300) + '...',
      total_characters: rawText.length,
      created_at: new Date().toISOString(),
    };

    const newTopics: Topic[] = [];
    const newObjectives: LearningObjective[] = [];

    // Map extracted topics
    analysis.topics.forEach((t, index) => {
      const topicId = `topic-${docId}-${index + 1}`;
      
      let prereqIds: string[] = [];
      if (index > 0) {
        prereqIds = [`topic-${docId}-${index}`];
      }

      newTopics.push({
        id: topicId,
        document_id: docId,
        title: t.title,
        description: t.description,
        difficulty: t.difficulty || 'intermediate',
        estimated_minutes: t.estimated_minutes || 25,
        order_index: index,
        prerequisites: prereqIds,
        status: index === 0 ? 'available' : 'locked',
        source_chunk: t.source_chunk || rawText.slice(index * 400, index * 400 + 400),
      });

      (t.learning_objectives || []).forEach((desc, objIdx) => {
        newObjectives.push({
          id: `obj-${topicId}-${objIdx + 1}`,
          topic_id: topicId,
          description: desc,
          mastered: false,
        });
      });
    });

    db.addDocument(newDoc, newTopics, newObjectives);

    res.json({
      success: true,
      document: newDoc,
      topicsCount: newTopics.length,
      objectivesCount: newObjectives.length,
      message: 'Document analyzed and structured learning path generated successfully!',
    });
  } catch (err: any) {
    console.error('PDF Upload Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error during upload' });
  }
});

router.post('/documents/text', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length < 30) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 30 characters of study notes or text material.',
      });
    }

    const rawText = content.trim();
    const docTitle = (title && typeof title === 'string' && title.trim()) ? title.trim() : 'Study Notes';

    const analysis = await aiService.analyseDocument(rawText, docTitle);

    const docId = `doc-${Date.now()}`;
    const newDoc: Document = {
      id: docId,
      title: analysis.title || docTitle,
      description: analysis.description || 'Pasted study material.',
      raw_text_preview: rawText.slice(0, 300) + '...',
      total_characters: rawText.length,
      created_at: new Date().toISOString(),
    };

    const newTopics: Topic[] = [];
    const newObjectives: LearningObjective[] = [];

    analysis.topics.forEach((t, index) => {
      const topicId = `topic-${docId}-${index + 1}`;
      let prereqIds: string[] = [];
      if (index > 0) {
        prereqIds = [`topic-${docId}-${index}`];
      }

      newTopics.push({
        id: topicId,
        document_id: docId,
        title: t.title,
        description: t.description,
        difficulty: t.difficulty || 'intermediate',
        estimated_minutes: t.estimated_minutes || 25,
        order_index: index,
        prerequisites: prereqIds,
        status: index === 0 ? 'available' : 'locked',
        source_chunk: t.source_chunk || rawText.slice(index * 400, index * 400 + 400),
      });

      (t.learning_objectives || []).forEach((desc, objIdx) => {
        newObjectives.push({
          id: `obj-${topicId}-${objIdx + 1}`,
          topic_id: topicId,
          description: desc,
          mastered: false,
        });
      });
    });

    db.addDocument(newDoc, newTopics, newObjectives);

    res.json({
      success: true,
      document: newDoc,
      topicsCount: newTopics.length,
      objectivesCount: newObjectives.length,
      message: 'Notes analyzed and structured learning path generated successfully!',
    });
  } catch (err: any) {
    console.error('Text Ingestion Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error during text analysis' });
  }
});

// ----------------------------------------------------
// 3. Topic Details & Study Session
// ----------------------------------------------------
router.get('/topics/:id', (req: Request, res: Response) => {
  try {
    const topic = db.getTopic(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found' });
    }

    const objectives = db.getObjectivesForTopic(topic.id);
    const attempts = db.getFeynmanAttempts(topic.id);
    const sessions = db.getStudySessions(topic.id);

    res.json({
      success: true,
      topic: {
        ...topic,
        objectives,
        attempts,
        sessions,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/topics/:id/study', (req: Request, res: Response) => {
  try {
    const topic = db.getTopic(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found' });
    }

    const { durationMinutes = 25, notes } = req.body;

    const session = {
      id: `session-${Date.now()}`,
      topic_id: topic.id,
      started_at: new Date(Date.now() - durationMinutes * 60000).toISOString(),
      completed_at: new Date().toISOString(),
      duration_minutes: Number(durationMinutes),
      notes,
    };

    db.recordStudySession(session);

    if (topic.status === 'available') {
      topic.status = 'in_progress';
      db.saveData();
    }

    res.json({ success: true, session, topic });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4. Feynman Check Submission & Evaluation
// ----------------------------------------------------
router.post('/topics/:id/feynman', async (req: Request, res: Response) => {
  try {
    const topic = db.getTopic(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found' });
    }

    const { explanation } = req.body;
    if (!explanation || typeof explanation !== 'string' || explanation.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide an explanation in your own words.' });
    }

    const objectives = db.getObjectivesForTopic(topic.id).map((o) => o.description);

    // Call AI Feynman Evaluator
    const evaluation = await aiService.evaluateFeynmanExplanation({
      topic,
      learningObjectives: objectives,
      sourceMaterial: topic.source_chunk,
      studentExplanation: explanation,
    });

    const attempt = {
      id: `attempt-${Date.now()}`,
      topic_id: topic.id,
      student_explanation: explanation,
      score: evaluation.score,
      passed: evaluation.passed,
      strengths: evaluation.strengths || [],
      missing_concepts: evaluation.missing_concepts || [],
      incorrect_concepts: evaluation.incorrect_concepts || [],
      feedback: evaluation.feedback || '',
      retry_prompt: evaluation.retry_prompt || '',
      created_at: new Date().toISOString(),
    };

    db.recordFeynmanAttempt(attempt);

    const updatedTopic = db.getTopic(topic.id);
    const updatedStats = db.getUserStats();

    res.json({
      success: true,
      evaluation,
      topic: updatedTopic,
      stats: updatedStats,
    });
  } catch (err: any) {
    console.error('Feynman Evaluation Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Evaluation failed' });
  }
});

// ----------------------------------------------------
// 5. Revisions
// ----------------------------------------------------
router.post('/revisions/:id/complete', (req: Request, res: Response) => {
  try {
    db.completeRevision(req.params.id);
    res.json({ success: true, message: 'Revision marked as completed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 6. Settings & AI Configuration
// ----------------------------------------------------
router.get('/settings', (_req: Request, res: Response) => {
  try {
    const config = db.getAiConfig();
    const effectiveApiKey = process.env.AI_API_KEY || config.api_key;
    const isConfigured = Boolean(effectiveApiKey && effectiveApiKey.length > 5);

    // Mask API key for client display
    let maskedKey = '';
    if (effectiveApiKey) {
      if (effectiveApiKey.length > 8) {
        maskedKey = `${effectiveApiKey.slice(0, 3)}••••••••${effectiveApiKey.slice(-4)}`;
      } else {
        maskedKey = '••••••••';
      }
    }

    res.json({
      success: true,
      settings: {
        provider: process.env.AI_PROVIDER || config.provider || 'openai',
        model: process.env.AI_MODEL || config.model || 'gpt-4o-mini',
        base_url: process.env.AI_BASE_URL || config.base_url || '',
        api_key_masked: maskedKey,
        is_configured: isConfigured,
        default_session_minutes: config.default_session_minutes || 25,
        default_break_minutes: config.default_break_minutes || 5,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings', (req: Request, res: Response) => {
  try {
    const { provider, model, base_url, api_key, default_session_minutes, default_break_minutes } = req.body;
    
    const updatePayload: any = {};
    if (provider) updatePayload.provider = provider;
    if (model) updatePayload.model = model;
    if (typeof base_url === 'string') updatePayload.base_url = base_url;
    if (typeof api_key === 'string' && api_key.trim().length > 0) {
      updatePayload.api_key = api_key.trim();
    }
    if (default_session_minutes) updatePayload.default_session_minutes = Number(default_session_minutes);
    if (default_break_minutes) updatePayload.default_break_minutes = Number(default_break_minutes);

    const updated = db.updateAiConfig(updatePayload);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        provider: updated.provider,
        model: updated.model,
        base_url: updated.base_url,
        is_configured: Boolean(updated.api_key),
        default_session_minutes: updated.default_session_minutes,
        default_break_minutes: updated.default_break_minutes,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings/test-connection', async (req: Request, res: Response) => {
  try {
    const result = await aiService.testConnection(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Connection test failed' });
  }
});

// ----------------------------------------------------
// 7. Demo Mode Management & Reset
// ----------------------------------------------------
router.post('/demo/reset', (_req: Request, res: Response) => {
  try {
    const freshData = db.resetToDemo();
    res.json({
      success: true,
      message: 'Reset to demo curriculum successfully',
      document: freshData.documents[0],
      topicsCount: freshData.topics.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/learning/reset-progress', (_req: Request, res: Response) => {
  try {
    db.wipeLearningProgress();
    res.json({
      success: true,
      message: 'Learning progress reset. All topics returned to initial sequence.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
