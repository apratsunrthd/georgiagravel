(function () {
  const difficultyOrder = {
    Friendly: 1,
    Moderate: 2,
    Challenging: 3
  };

  const tableBody = document.querySelector('[data-routes-table-body]');
  const sortableHeaders = document.querySelectorAll('[data-sort-key]');
  const routes = Array.isArray(window.routes) ? [...window.routes] : [];

  function toNumber(value) {
    if (typeof value !== 'string') return 0;
    const match = value.match(/([\d.,]+)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(/,/g, '')) || 0;
  }

  function getSortValue(route, key) {
    switch (key) {
      case 'distance':
        return toNumber(route.stats?.distance);
      case 'elevation':
        return toNumber(route.stats?.elevation);
      case 'difficulty':
        return difficultyOrder[route.difficulty] || Number.MAX_SAFE_INTEGER;
      case 'region':
        return route.region?.toLowerCase?.() || '';
      default:
        return 0;
    }
  }

  function renderRows(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    data.forEach((route) => {
      const row = document.createElement('tr');

      const titleCell = document.createElement('td');
      const titleLink = document.createElement('a');
      const detailHref = `/route.html?slug=${encodeURIComponent(route.slug)}`;

      titleLink.href = detailHref;
      titleLink.textContent = route.title;
      titleCell.appendChild(titleLink);

      const distanceCell = document.createElement('td');
      distanceCell.textContent = route.stats?.distance || '—';

      const elevationCell = document.createElement('td');
      elevationCell.textContent = route.stats?.elevation || '—';

      const difficultyCell = document.createElement('td');
      difficultyCell.textContent = route.difficulty || '—';

      const regionCell = document.createElement('td');
      regionCell.textContent = route.region || '—';

      row.append(titleCell, distanceCell, elevationCell, difficultyCell, regionCell);
      tableBody.appendChild(row);
    });
  }

  function sortData(key, direction) {
    const sorted = [...routes].sort((a, b) => {
      const aVal = getSortValue(a, key);
      const bVal = getSortValue(b, key);

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    renderRows(sorted);
  }

  sortableHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const key = header.dataset.sortKey;
      const currentDirection = header.dataset.sortDirection || 'desc';
      const nextDirection = currentDirection === 'asc' ? 'desc' : 'asc';

      sortableHeaders.forEach((h) => h.removeAttribute('data-sort-direction'));
      header.dataset.sortDirection = nextDirection;

      sortData(key, nextDirection);
    });
  });

  renderRows(routes);
})();
