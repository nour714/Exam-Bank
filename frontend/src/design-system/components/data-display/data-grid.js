/**
 * Data Grid Component.
 * @param {Object} props
 * @param {Array<Object>} props.columns - [{ id, title, render(row), width }]
 * @param {Array<Object>} props.data - Array of row objects
 * @param {boolean} [props.loading]
 * @param {string} [props.emptyMessage='No data available.']
 * @returns {HTMLDivElement}
 */
export function DataGrid({ columns, data, loading = false, emptyMessage = 'No data available.' }) {
  const container = document.createElement('div');
  container.className = 'data-grid-container';
  container.style.overflowX = 'auto';

  const table = document.createElement('table');
  table.className = 'data-grid-table';
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  // ─── Header ───
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  trHead.style.borderBottom = '1px solid var(--border-color)';
  trHead.style.backgroundColor = 'var(--surface-hover)';

  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.title;
    th.style.padding = 'var(--space-3)';
    th.style.textAlign = 'left';
    th.style.fontWeight = 'var(--font-semibold)';
    th.style.color = 'var(--text-secondary)';
    if (col.width) th.style.width = col.width;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // ─── Body ───
  const tbody = document.createElement('tbody');

  if (loading) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length;
    td.style.padding = 'var(--space-8)';
    td.style.textAlign = 'center';
    td.innerHTML = '<span class="spinner spinner-md"></span>';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else if (!data || data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length;
    td.style.padding = 'var(--space-8)';
    td.style.textAlign = 'center';
    td.style.color = 'var(--text-muted)';
    td.textContent = emptyMessage;
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.style.transition = 'background-color var(--transition-fast)';
      tr.onmouseenter = () => tr.style.backgroundColor = 'var(--surface-hover)';
      tr.onmouseleave = () => tr.style.backgroundColor = 'transparent';

      columns.forEach(col => {
        const td = document.createElement('td');
        td.style.padding = 'var(--space-3)';
        
        if (col.render) {
          const content = col.render(row);
          if (content instanceof HTMLElement) {
            td.appendChild(content);
          } else {
            td.innerHTML = content;
          }
        } else {
          td.textContent = row[col.id];
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}
