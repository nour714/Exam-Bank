const MY_GROUPS = [
  { id: 'g1', name: 'مجموعة الرياضيات المتقدمة', description: 'مراجعة جبر وتفاضل وتكامل قبل الامتحانات النهائية.', isPrivate: false, inviteCode: 'MATH2026', _count: { members: 24 } }
];

const PUBLIC_GROUPS = [
  { id: 'g2', name: 'أصدقاء الفيزياء', description: 'حل مسائل الميكانيكا والكهرباء أسبوعياً.', isPrivate: false, inviteCode: 'PHYS2026', _count: { members: 18 } },
  { id: 'g3', name: 'نادي الكيمياء العضوية', description: 'شرح التفاعلات العضوية بطريقة مبسطة.', isPrivate: false, inviteCode: 'CHEM2026', _count: { members: 15 } },
  { id: 'g4', name: 'مجموعة اللغة العربية', description: 'مراجعة النحو والبلاغة والنصوص.', isPrivate: false, inviteCode: 'ARAB2026', _count: { members: 30 } }
];

// A private group only joinable via its invite code (not shown in discover)
const PRIVATE_GROUPS = [
  { id: 'g5', name: 'مجموعة أصدقاء الفصل', description: 'مجموعة خاصة لأصدقاء الفصل.', isPrivate: true, inviteCode: 'FRIENDS99', _count: { members: 8 } }
];

let nextId = 6;

export const StudyGroupsMockProvider = {
  async getMyGroups() {
    return new Promise(resolve => setTimeout(() => resolve([...MY_GROUPS]), 500));
  },

  async getPublicGroups() {
    return new Promise(resolve => setTimeout(() => resolve([...PUBLIC_GROUPS]), 500));
  },

  async createGroup(payload) {
    return new Promise(resolve => {
      setTimeout(() => {
        const group = {
          id: `g${nextId++}`,
          name: payload.name,
          description: payload.description || '',
          isPrivate: !!payload.isPrivate,
          inviteCode: Math.random().toString(36).slice(2, 10).toUpperCase(),
          _count: { members: 1 }
        };
        MY_GROUPS.unshift(group);
        resolve(group);
      }, 500);
    });
  },

  async joinGroup(groupId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = PUBLIC_GROUPS.findIndex(g => g.id === groupId);
        if (idx === -1) return reject(new Error('Group not found'));
        const [group] = PUBLIC_GROUPS.splice(idx, 1);
        group._count.members += 1;
        MY_GROUPS.unshift(group);
        resolve({ groupId, userId: 'me', role: 'MEMBER' });
      }, 400);
    });
  },

  async joinByCode(inviteCode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const all = [...PUBLIC_GROUPS, ...PRIVATE_GROUPS];
        const idx = all.findIndex(g => g.inviteCode === inviteCode);
        if (idx === -1) return reject(new Error('Invalid invite code'));
        const group = all[idx];
        const publicIdx = PUBLIC_GROUPS.findIndex(g => g.id === group.id);
        if (publicIdx !== -1) PUBLIC_GROUPS.splice(publicIdx, 1);
        const privateIdx = PRIVATE_GROUPS.findIndex(g => g.id === group.id);
        if (privateIdx !== -1) PRIVATE_GROUPS.splice(privateIdx, 1);
        group._count.members += 1;
        MY_GROUPS.unshift(group);
        resolve({ group, member: { groupId: group.id, userId: 'me', role: 'MEMBER' } });
      }, 400);
    });
  }
};
