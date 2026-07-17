/**
 * Chart Component wrapping Chart.js.
 * Ensure Chart.js is loaded in the global scope (e.g. via CDN in index.html) before using.
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.type - 'line' | 'bar' | 'doughnut' | 'pie'
 * @param {Object} props.data - Chart.js data object
 * @param {Object} [props.options] - Chart.js options
 * @returns {HTMLCanvasElement}
 */
export function ChartView({ id, type, data, options = {} }) {
  const container = document.createElement('div');
  container.className = 'chart-container';
  container.style.position = 'relative';
  container.style.width = '100%';
  container.style.height = '100%';

  const canvas = document.createElement('canvas');
  canvas.id = id;
  container.appendChild(canvas);

  // Defer initialization until the element is in the DOM
  setTimeout(() => {
    if (!window.Chart) {
      console.error('[ChartView] Chart.js is not loaded.');
      return;
    }

    const ctx = canvas.getContext('2d');
    
    // Auto-detect theme colors for text if not specified
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
          }
        }
      },
      scales: type !== 'pie' && type !== 'doughnut' ? {
        x: {
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted').trim() },
          grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color').trim() }
        },
        y: {
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted').trim() },
          grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color').trim() }
        }
      } : {}
    };

    // Deep merge options
    const mergedOptions = { ...defaultOptions, ...options };

    // Instantiate Chart.js and bind to element for later destruction
    const chartInstance = new window.Chart(ctx, {
      type,
      data,
      options: mergedOptions,
    });

    container.__chartInstance = chartInstance;
  }, 0);

  return container;
}
