import { store } from '../../core/state-store.js';
import { ChartView } from '../../design-system/components/charts/chart-view.js';
import { DataGrid } from '../../design-system/components/data-display/data-grid.js';
import { dbService } from '../../services/indexeddb.service.js';

export async function DashboardPage() {
  const container = document.createElement('div');
  container.className = 'container py-6 flex-col gap-6';

  const user = store.get('user');

  // Header
  const header = document.createElement('div');
  header.innerHTML = `
    <h2 class="font-bold">Dashboard</h2>
    <p class="text-secondary mt-1">Welcome back, ${user?.firstName}. Here is your overview.</p>
  `;
  container.appendChild(header);

  // Stats Row
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-4';
  
  const stats = [
    { label: 'Active Exams', value: '12' },
    { label: 'Completed', value: '45' },
    { label: 'Average Score', value: '82%' },
    { label: 'Study Groups', value: '3' }
  ];

  stats.forEach(stat => {
    const card = document.createElement('div');
    card.className = 'card p-4 text-center';
    card.innerHTML = `
      <p class="text-sm text-secondary">${stat.label}</p>
      <h3 class="text-2xl font-bold mt-2 text-primary-600">${stat.value}</h3>
    `;
    statsRow.appendChild(card);
  });
  container.appendChild(statsRow);

  // Charts Row
  const chartsRow = document.createElement('div');
  chartsRow.className = 'grid grid-cols-2 gap-4 mt-6';

  const activityChartCard = document.createElement('div');
  activityChartCard.className = 'card p-4';
  activityChartCard.innerHTML = '<h4 class="font-semibold mb-4">Activity Overview</h4>';
  
  // Dummy Data for Chart
  const chartWrapper = document.createElement('div');
  chartWrapper.style.height = '250px';
  chartWrapper.appendChild(ChartView({
    id: 'activity-chart',
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Exams Taken',
        data: [2, 5, 3, 8, 4, 1, 0],
        borderColor: '#6C5CE7',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }
  }));
  activityChartCard.appendChild(chartWrapper);
  chartsRow.appendChild(activityChartCard);

  const breakdownChartCard = document.createElement('div');
  breakdownChartCard.className = 'card p-4';
  breakdownChartCard.innerHTML = '<h4 class="font-semibold mb-4">Performance Breakdown</h4>';
  
  const pieWrapper = document.createElement('div');
  pieWrapper.style.height = '250px';
  pieWrapper.appendChild(ChartView({
    id: 'breakdown-chart',
    type: 'doughnut',
    data: {
      labels: ['Mathematics', 'Science', 'History', 'Languages'],
      datasets: [{
        data: [30, 25, 20, 25],
        backgroundColor: ['#6C5CE7', '#00BCD4', '#F59E0B', '#10B981']
      }]
    }
  }));
  breakdownChartCard.appendChild(pieWrapper);
  chartsRow.appendChild(breakdownChartCard);

  container.appendChild(chartsRow);

  // Recent Exams Grid
  const gridCard = document.createElement('div');
  gridCard.className = 'card p-0 mt-6';
  
  const gridHeader = document.createElement('div');
  gridHeader.className = 'card-header';
  gridHeader.innerHTML = '<h4 class="font-semibold">Recent Exams</h4>';
  gridCard.appendChild(gridHeader);

  const gridData = [
    { id: '1', title: 'Calculus Midterm', date: '2026-07-15', score: '88%', status: 'Completed' },
    { id: '2', title: 'World History Quiz', date: '2026-07-14', score: '92%', status: 'Completed' },
    { id: '3', title: 'Biology Final', date: '2026-07-18', score: '-', status: 'Scheduled' },
  ];

  const grid = DataGrid({
    columns: [
      { id: 'title', title: 'Exam Title' },
      { id: 'date', title: 'Date' },
      { id: 'score', title: 'Score' },
      { 
        id: 'status', 
        title: 'Status',
        render: (row) => {
          const color = row.status === 'Completed' ? 'var(--color-success-500)' : 'var(--color-warning-500)';
          return `<span style="color: ${color}; font-weight: 500;">${row.status}</span>`;
        }
      }
    ],
    data: gridData
  });
  gridCard.appendChild(grid);
  container.appendChild(gridCard);

  // Check Offline Sync Queue (example logic)
  try {
    const syncQueue = await dbService.getSyncQueue();
    if (syncQueue && syncQueue.length > 0) {
      const alert = document.createElement('div');
      alert.className = 'p-4 mt-6 rounded';
      alert.style.backgroundColor = 'var(--color-warning-50)';
      alert.style.color = 'var(--color-warning-600)';
      alert.style.border = '1px solid var(--color-warning-500)';
      alert.innerHTML = `<strong>Offline Sync Pending:</strong> You have ${syncQueue.length} actions waiting to sync to the server.`;
      container.insertBefore(alert, container.firstChild);
    }
  } catch (err) {
    console.error('Error checking sync queue', err);
  }

  return container;
}
