import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let projects = [];
let selectedIndex = -1;
(async function () {
  projects = await fetchJSON('../lib/projects.json');
  const projectsContainer = document.querySelector('.projects');
  renderProjects(projects, projectsContainer, 'h2');
  const projectsTitle = document.querySelector('.projects-title');
  if (projectsTitle) {
    projectsTitle.textContent = `Projects: ${projects.length}`;
  }
  const svg = d3.select('svg');
  svg.selectAll('path').remove();

  const legend = d3.select('.legend');
  legend.selectAll('li').remove();
  
  const rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));


let colors = d3.scaleOrdinal(d3.schemeTableau10);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(35);
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
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
    });
});
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
    });
});
})();
const searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();

  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  const projectsContainer = document.querySelector('.projects');
  renderProjects(filteredProjects, projectsContainer, 'h2');

  const projectsTitle = document.querySelector('.projects-title');
  if (projectsTitle) {
    projectsTitle.textContent = `Projects: ${filteredProjects.length}`;
  }
  let svg = d3.select('svg');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  const rolledData = d3.rollups(
    filteredProjects,
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

  arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color: ${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
});