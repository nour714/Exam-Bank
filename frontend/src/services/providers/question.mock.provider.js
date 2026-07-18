const MOCK_DB = Array.from({ length: 150 }).map((_, i) => ({
  id: `q${i + 1}`,
  subjectId: i % 2 === 0 ? 'math' : 'physics',
  unitId: i % 2 === 0 ? 'unit1' : 'unit2',
  lessonId: 'lesson1',
  type: i % 3 === 0 ? 'multiple-choice' : 'open-ended',
  difficulty: i % 4 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
  tags: ['algebra', 'basics', i % 5 === 0 ? 'advanced' : 'core'],
  source: i % 3 === 0 ? 'ministry' : (i % 2 === 0 ? 'external' : 'internal'),
  status: i % 10 === 0 ? 'archived' : (i % 5 === 0 ? 'draft' : 'published'),
  metadata: { points: 10, aiGenerated: i % 4 === 0, estimatedTime: '2m' },
  createdAt: new Date(Date.now() - i * 100000).toISOString(),
  updatedAt: new Date(Date.now() - i * 50000).toISOString(),
  author: 'أحمد محمود',
  version: `v1.${i % 5}`,
  attachments: i % 6 === 0 ? [{ id: 'a1', type: 'image', url: 'https://via.placeholder.com/150', name: 'diagram.png' }] : [],
  content: `This is the question content for question ${i + 1}. What is the correct answer?`,
  richContent: `<p>This is the <strong>rich content</strong> for question ${i + 1}.</p><p>It may contain images, formulas, and extended explanations.</p>`,
  options: i % 3 === 0 ? [
    { id: 'o1', text: 'Option A', isCorrect: true },
    { id: 'o2', text: 'Option B', isCorrect: false },
    { id: 'o3', text: 'Option C', isCorrect: false },
    { id: 'o4', text: 'Option D', isCorrect: false }
  ] : null,
  explanation: `This is the official explanation for question ${i + 1}.`
}));

export const QuestionMockProvider = {
  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const q = MOCK_DB.find(item => item.id === id);
        if (q) resolve(JSON.parse(JSON.stringify(q)));
        else reject(new Error('Question not found'));
      }, 400); 
    });
  },

  async search(criteria) {
    return new Promise(resolve => {
      setTimeout(() => {
        let results = MOCK_DB.filter(q => !q.deleted); // Exclude deleted by default unless filtering by deleted? Actually let's assume search excludes soft deleted

        // Apply text search
        if (criteria.q) {
          const q = criteria.q.toLowerCase();
          results = results.filter(item => item.content.toLowerCase().includes(q) || item.id.includes(q));
        }

        // Apply filters
        for (const [key, val] of Object.entries(criteria.filters || {})) {
          if (val === 'all' || val === null || val === '') continue;
          
          if (key === 'tags') {
            const tagQuery = String(val).toLowerCase();
            results = results.filter(item => item.tags && item.tags.some(t => t.toLowerCase().includes(tagQuery)));
          } else if (key === 'dateRange') {
            const now = Date.now();
            results = results.filter(item => {
              const itemDate = new Date(item.createdAt).getTime();
              if (val === 'today') return (now - itemDate) < 86400000;
              if (val === 'week') return (now - itemDate) < 86400000 * 7;
              if (val === 'month') return (now - itemDate) < 86400000 * 30;
              return true;
            });
          } else {
            results = results.filter(item => item[key] === val);
          }
        }

        // Apply sorting
        if (criteria.sort && criteria.sort.field) {
          const dir = criteria.sort.direction === 'desc' ? -1 : 1;
          results.sort((a, b) => {
            if (a[criteria.sort.field] > b[criteria.sort.field]) return dir;
            if (a[criteria.sort.field] < b[criteria.sort.field]) return -dir;
            return 0;
          });
        }

        // Apply pagination
        const pageSize = criteria.pageSize || 20;
        let startIndex = 0;
        if (criteria.cursor) {
          startIndex = results.findIndex(i => i.id === criteria.cursor) + 1;
        }

        const paginatedResults = results.slice(startIndex, startIndex + pageSize);
        const hasMore = startIndex + pageSize < results.length;
        const nextCursor = hasMore ? paginatedResults[paginatedResults.length - 1].id : null;

        resolve({
          data: JSON.parse(JSON.stringify(paginatedResults)),
          hasMore,
          nextCursor,
          total: results.length
        });
      }, 500); 
    });
  },

  async create(payload) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newQuestion = {
          ...payload,
          id: `q${MOCK_DB.length + 1}_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: payload.status || 'draft',
          deleted: false
        };
        MOCK_DB.unshift(newQuestion); // Add to top
        resolve(JSON.parse(JSON.stringify(newQuestion)));
      }, 400);
    });
  },

  async update(id, payload) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_DB.findIndex(q => q.id === id);
        if (index === -1) return reject(new Error('Not found'));
        
        MOCK_DB[index] = {
          ...MOCK_DB[index],
          ...payload,
          id, // protect id
          updatedAt: new Date().toISOString()
        };
        resolve(JSON.parse(JSON.stringify(MOCK_DB[index])));
      }, 400);
    });
  },

  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_DB.findIndex(q => q.id === id);
        if (index === -1) return reject(new Error('Not found'));
        MOCK_DB[index].deleted = true;
        resolve({ success: true });
      }, 300);
    });
  },

  async restore(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_DB.findIndex(q => q.id === id);
        if (index === -1) return reject(new Error('Not found'));
        MOCK_DB[index].deleted = false;
        resolve(JSON.parse(JSON.stringify(MOCK_DB[index])));
      }, 300);
    });
  },

  async permanentDelete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_DB.findIndex(q => q.id === id);
        if (index === -1) return reject(new Error('Not found'));
        MOCK_DB.splice(index, 1);
        resolve({ success: true });
      }, 300);
    });
  }
};
