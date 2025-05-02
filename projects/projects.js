import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

(async function () {
  const projects = await fetchJSON('../lib/projects.json');
  const projectsContainer = document.querySelector('.projects');
  renderProjects(projects, projectsContainer, 'h2');
  const projectsTitle = document.querySelector('.projects-title');
  if (projectsTitle) {
    projectsTitle.textContent = `Projects: ${projects.length}`;
  }
})();

const data = [
  { value: 1, label: 'apples' },
  { value: 2, label: 'oranges' },
  { value: 3, label: 'mangos' },
  { value: 4, label: 'pears' },
  { value: 5, label: 'limes' },
  { value: 5, label: 'cherries' },
];


const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const sliceGenerator = d3.pie().value(d => d.value);
const arcData = sliceGenerator(data);
const colors = d3.scaleOrdinal(d3.schemeTableau10);


const svg = d3.select('#projects-pie-plot')
  .append('svg')
  .attr('viewBox', '-50 -50 100 100')
  .append('g');

svg.selectAll('path')
  .data(arcData)
  .enter()
  .append('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, i) => colors(i));

const legend = d3.select('.legend');
data.forEach((d, i) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(i)}`)
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});
