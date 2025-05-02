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


let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let data = [1, 2]; 
let arcs = arcData.map((d) => arcGenerator(d));
let colors = ['gold', 'purple'];
arcs.forEach((arc, idx) => {
  d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors[idx]);
});