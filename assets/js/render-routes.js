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

  function createExtrasSection(extras) {
    if (!extras || (!extras.review && !extras.instagram)) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'route-extra-inline';

    const parts = [];

    if (extras.review) {
      parts.push(`
        <a href="${extras.review.url}" target="_blank" rel="noopener" class="extra-link">
          <svg class="extra-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="var(--accent)" d="M4 4h16v2H4zm0 4h16v2H4zm0 4h16v10L12 16 4 22z"/>
          </svg>
          Review
        </a>
      `);
    }

    if (extras.instagram) {
      parts.push(`
        <a href="${extras.instagram.url}" target="_blank" rel="noopener" class="extra-link">
          <svg class="extra-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="var(--accent)" d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A5.51 5.51 0 006.5 13 5.51 5.51 0 0012 18.5 5.51 5.51 0 0017.5 13 5.51 5.51 0 0012 7.5zm0 2A3.48 3.48 0 0115.5 13 3.48 3.48 0 0112 16.5 3.48 3.48 0 018.5 13 3.48 3.48 0 0112 9.5zM17.8 6.2a1 1 0 11-2 0 1 1 0 012 0z"/>
          </svg>

          Video
        </a>
      `);
    }

    wrapper.innerHTML = parts.join('<span class="divider">|</span>');
    return wrapper;
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

    const detailHref = `/route.html?slug=${encodeURIComponent(route.slug)}`;

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

    const extrasSection = createExtrasSection(route.extras);
    const credit = document.createElement('p');
    credit.className = 'route-card__credit';
    credit.innerHTML = route.creditHtml;

    if (extrasSection) {
      text.append(header, summary, extrasSection, stats, links, credit);
    } else {
      text.append(header, summary, stats, links, credit);
    }

    const mapFrame = document.createElement('div');
    mapFrame.className = 'map-frame';

    const label = document.createElement('div');

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
