(function () {
  const difficultyClasses = {
    Friendly: 'easy',
    Moderate: 'moderate',
    Challenging: 'hard'
  };

  function buildLink({ href, label }) {
    if (!href) return null;
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.textContent = label;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    return anchor;
  }

  function mapDifficultyToClass(difficulty) {
    const mapped = difficultyClasses[difficulty];
    return mapped ? `badge badge--${mapped}` : 'badge';
  }

  function createStatsList(stats) {
    const list = document.createElement('dl');
    list.className = 'route-card__stats';

    const statEntries = [
      { label: 'Distance', value: stats?.distance },
      { label: 'Elevation', value: stats?.elevation },
      { label: 'Ride time', value: stats?.rideTime }
    ];

    statEntries.forEach(({ label, value }) => {
      if (!value) return;
      const wrapper = document.createElement('div');
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      wrapper.append(dt, dd);
      list.appendChild(wrapper);
    });

    return list;
  }

  function createRouteCard(route) {
    const card = document.createElement('article');
    card.className = 'route-card';

    const text = document.createElement('div');
    text.className = 'route-card__text';

    const header = document.createElement('div');
    header.className = 'route-card__header';

    const headerText = document.createElement('div');
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = route.region;

    const isRoutesPage = window.location.pathname.includes('/routes/');
    const detailHref = isRoutesPage ? `${route.slug}.html` : `routes/${route.slug}.html`;

    const titleLink = document.createElement('a');
    titleLink.className = 'route-card__title-link';
    titleLink.href = detailHref;
    titleLink.textContent = route.title;

    const title = document.createElement('h3');
    title.appendChild(titleLink);

    headerText.append(eyebrow, title);

    const badge = document.createElement('span');
    badge.className = mapDifficultyToClass(route.difficulty);
    badge.textContent = route.difficulty;

    header.append(headerText, badge);

    const summary = document.createElement('p');
    summary.className = 'route-card__summary';
    summary.textContent = route.summary;

    const stats = createStatsList(route.stats);

    const links = document.createElement('div');
    links.className = 'route-card__links';

    const rideWithGpsLink = buildLink({ href: route.links?.rideWithGps, label: 'RideWithGPS' });
    const stravaLink = buildLink({ href: route.links?.strava, label: 'Strava' });
    const garminLink = buildLink({ href: route.links?.garmin, label: 'Garmin' });
    const gpxLink = buildLink({ href: route.links?.gpx, label: 'Download GPX' });
    if (gpxLink && route.links?.gpx?.endsWith('.gpx')) {
      gpxLink.removeAttribute('target');
      gpxLink.removeAttribute('rel');
      gpxLink.setAttribute('download', '');
    }

    [rideWithGpsLink, stravaLink, garminLink, gpxLink]
      .filter(Boolean)
      .forEach((anchor) => links.appendChild(anchor));

    const credit = document.createElement('p');
    credit.className = 'route-card__credit';
    credit.innerHTML = route.creditHtml;

    text.append(header, summary, stats, links, credit);

    const mapFrame = document.createElement('div');
    mapFrame.className = 'map-frame';

    const label = document.createElement('div');
    label.className = 'map-frame__label';
    label.textContent = 'Preview';

    const iframe = document.createElement('iframe');
    iframe.src = route.embedUrl;
    iframe.loading = 'lazy';
    iframe.title = route.embedTitle || `${route.title} map`;

    mapFrame.append(label, iframe);
    card.append(text, mapFrame);

    return card;
  }

  function renderRecentRoutes(container, limit = 4) {
    if (!Array.isArray(window.routes) || !container) return;
    const sorted = [...window.routes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    sorted.slice(0, limit).forEach((route) => {
      container.appendChild(createRouteCard(route));
    });
  }

  function renderSingleRoute(container, slug) {
    if (!Array.isArray(window.routes) || !container || !slug) return;
    const match = window.routes.find((route) => route.slug === slug);
    if (!match) return;
    container.appendChild(createRouteCard(match));
  }

  window.routeComponents = {
    createRouteCard,
    renderRecentRoutes,
    renderSingleRoute
  };
})();
