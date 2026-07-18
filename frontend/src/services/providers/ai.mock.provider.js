import { eventBus } from '../../core/event-bus.js';

const activeJobs = new Map();

export const AiMockProvider = {
  async generateQuestions(request) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const numQuestions = request.count || 3;
    
    // Simulate background processing
    const job = {
      id: jobId,
      status: 'processing',
      progress: 0,
      interval: setInterval(() => {
        const currentJob = activeJobs.get(jobId);
        if (!currentJob || currentJob.status !== 'processing') {
          clearInterval(job.interval);
          return;
        }

        currentJob.progress += 20;
        
        eventBus.emit('ai.generation.progress', {
          jobId,
          progress: currentJob.progress
        });

        if (currentJob.progress >= 100) {
          clearInterval(job.interval);
          currentJob.status = 'completed';
          
          // Generate mock results
          const results = Array.from({ length: numQuestions }).map((_, i) => ({
            id: `ai_${jobId}_${i}`,
            subjectId: request.subjectId || 'math',
            unitId: request.unitId || 'unit1',
            lessonId: request.lessonId || 'lesson1',
            type: request.type || 'multiple-choice',
            difficulty: request.difficulty || 'medium',
            content: `[AI Generated] ${request.prompt ? 'Focus: ' + request.prompt : 'Sample question'} - Part ${i + 1}`,
            explanation: `This is an AI generated explanation for question ${i + 1}.`,
            metadata: {
              aiGenerated: true,
              bloomTaxonomy: request.bloomTaxonomy || 'understanding',
              confidenceScore: 0.95
            },
            tags: ['ai-generated', request.bloomTaxonomy || 'understanding'],
            status: 'draft',
            options: request.type === 'multiple-choice' || !request.type ? [
              { id: 'o1', text: 'Option A (Correct)', isCorrect: true },
              { id: 'o2', text: 'Option B', isCorrect: false },
              { id: 'o3', text: 'Option C', isCorrect: false },
              { id: 'o4', text: 'Option D', isCorrect: false }
            ] : null,
          }));

          eventBus.emit('ai.generation.completed', {
            jobId,
            results,
            observability: {
              durationMs: 2500, // Simulated duration
              provider: 'MockAI',
              model: 'mock-gpt-4o',
              tokens: 1450,
              cost: 0.0015,
              status: 'success'
            }
          });
          
          activeJobs.delete(jobId);
        }
      }, 500)
    };

    activeJobs.set(jobId, job);

    return { jobId };
  },

  async cancelGeneration(jobId) {
    const job = activeJobs.get(jobId);
    if (job) {
      job.status = 'cancelled';
      clearInterval(job.interval);
      activeJobs.delete(jobId);
      eventBus.emit('ai.generation.failed', {
        jobId,
        error: 'Generation cancelled by user'
      });
      return { success: true };
    }
    return { success: false, error: 'Job not found' };
  }
};
