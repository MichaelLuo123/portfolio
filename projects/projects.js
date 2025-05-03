import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let projects = [];
let selectedIndex = -1;

(async function () {
  projects = await fetchJSON('../lib/projects.json');
  const projectsContainer = document.querySelector('.projects');
  const projectsTitle = document.querySelector('.projects-title');
  renderProjects(projects, projectsContainer, 'h2');
  if (projectsTitle) {
    projectsTitle.textContent = `Projects: ${projects.length}`;
  }

  let svg = d3.select('svg');
  let legend = d3.select('.legend');

  const updateVisualization = (dataSet) => {
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    const rolledData = d3.rollups(
      dataSet,
      (v) => v.length,
      (d) => d.year
    );

    const data = rolledData.map(([year, count]) => ({
      value: count,
      label: year
    }));

    const colors = d3.scaleOrdinal(d3.schemeTableau10);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(35);
    const sliceGenerator = d3.pie().value((d) => d.value);
    const arcData = sliceGenerator(data);
    const arcs = arcData.map((d) => arcGenerator(d));

    // Draw arcs
    arcs.forEach((arc, idx) => {
      svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .attr('class', selectedIndex === idx ? 'selected' : '')
        .on('click', () => {
          selectedIndex = selectedIndex === idx ? -1 : idx;

          svg.selectAll('path')
            .attr('class', (_, i) => (selectedIndex === i ? 'selected' : ''));

          legend.selectAll('li')
            .attr('class', (_, i) => 'legend-item' + (selectedIndex === i ? ' selected' : ''));

          const selectedYear = selectedIndex === -1 ? null : data[selectedIndex].label;
          const filtered = selectedYear
            ? projects.filter((p) => p.year === selectedYear)
            : projects;

          renderProjects(filtered, projectsContainer, 'h2');
          if (projectsTitle) {
            projectsTitle.textContent = `Projects: ${filtered.length}`;
          }
        });
    });

    // Draw legend
    data.forEach((d, idx) => {
      legend.append('li')
        .attr('style', `--color: ${colors(idx)}`)
        .attr('class', 'legend-item' + (selectedIndex === idx ? ' selected' : ''))
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .on('click', () => {
          selectedIndex = selectedIndex === idx ? -1 : idx;

          svg.selectAll('path')
            .attr('class', (_, i) => (selectedIndex === i ? 'selected' : ''));

          legend.selectAll('li')
            .attr('class', (_, i) => 'legend-item' + (selectedIndex === i ? ' selected' : ''));

          const selectedYear = selectedIndex === -1 ? null : data[selectedIndex].label;
          const filtered = selectedYear
            ? projects.filter((p) => p.year === selectedYear)
            : projects;

          renderProjects(filtered, projectsContainer, 'h2');
          if (projectsTitle) {
            projectsTitle.textContent = `Projects: ${filtered.length}`;
          }
        });
    });
  };

  updateVisualization(projects);


  const searchInput = document.querySelector('.searchBar');
  searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();

    const filteredProjects = projects.filter((project) => {
      const values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });

    selectedIndex = -1; 
    updateVisualization(filteredProjects);
    renderProjects(filteredProjects, projectsContainer, 'h2');
    if (projectsTitle) {
      projectsTitle.textContent = `Projects: ${filteredProjects.length}`;
    }
  });
})();
