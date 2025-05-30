import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';
let xScale;
let yScale;
let commitProgress = 100;
let timeScale;
async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), 
      depth: Number(row.depth), 
      length: Number(row.length), 
      date: new Date(row.date + 'T00:00' + row.timezone), 
      datetime: new Date(row.datetime), 
    }));
  
    return data;
  }
function processCommits(data) {
    return d3
      .groups(data, d => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
  
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          enumerable: false,
          writable: true,
          configurable: true,
        });
  
        return ret;
      });
  }
function renderCommitInfo(data, commits) {
  const container = d3.select('#stats');
  container.selectAll('*').remove();  // Clear old stats

  const dl = container.append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  dl.append('dt').text('Number of files');
  dl.append('dd').text(d3.group(data, d => d.file).size);

  dl.append('dt').text('Maximum depth');
  dl.append('dd').text(d3.max(data, d => d.depth));

  dl.append('dt').text('Average line length');
  dl.append('dd').text(d3.mean(data, d => d.length).toFixed(2));
}
function updateScatterPlot(data, filteredCommits) {
    d3.select('svg').remove(); 

    const sortedCommits = d3.sort(filteredCommits, d => -d.totalLines);
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    xScale = d3
        .scaleTime()
        .domain(d3.extent(filteredCommits, d => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    yScale = d3
        .scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
    const rScale = d3
        .scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]);

    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    gridlines.call(
        d3.axisLeft(yScale)
            .tickFormat('')
            .tickSize(-usableArea.width)
    );

    const dots = svg.append('g').attr('class', 'dots');
    dots.selectAll('circle')
    .data(sortedCommits, d => d.id)
    .join(
      enter => enter.append('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', 0)
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
            d3.select(event.currentTarget).style('fill-opacity', 1);
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', (event) => {
            d3.select(event.currentTarget).style('fill-opacity', 0.7);
            updateTooltipVisibility(false);
        })
        .transition()
        .duration(400)
        .attr('r', d => rScale(d.totalLines)),

      update => update
        .transition()
        .duration(400)
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => rScale(d.totalLines)),

      exit => exit
        .transition()
        .duration(200)
        .attr('r', 0)
        .remove()
    );

    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(d3.axisBottom(xScale));

    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));

    svg.call(d3.brush().on('start brush end', brushed));
    svg.selectAll('.dots, .overlay ~ *').raise();
}

function renderTooltipContent(commit) {
    if (Object.keys(commit).length === 0) return;
  
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime.toLocaleDateString('en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    time.textContent = commit.datetime.toLocaleTimeString('en');
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
  }
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}
function createBrushSelector(svg) {
    svg.call(d3.brush());
}
function brushed(event) {
    const selection = event.selection;
    renderSelectionCount(selection);
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(selection, d));
    renderLanguageBreakdown(selection);
}
function isCommitSelected(selection, commit) {
    if (!selection) {
        return false;
    }
    const [[x0, y0], [x1, y1]] = selection;
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}
function renderSelectionCount(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
  
    const countElement = document.querySelector('#selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
}
function renderLanguageBreakdown(selection) {
    const selectedCommits = selection
        ? commits.filter((d) => isCommitSelected(selection, d))
        : [];
    
    const container = document.getElementById('language-breakdown');
    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
    const breakdown = d3.rollup(
        lines,
        (v) => v.length, 
        (d) => d.type 
    );
    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length; 
        const formatted = d3.format('.1~%')(proportion); 

        container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
    }
}
let data = await loadData();
let commits = processCommits(data);
timeScale = d3.scaleTime()
  .domain(d3.extent(commits, d => d.datetime))
  .range([0, 100]);
const slider = document.getElementById('commit-slider');
const selectedTime = document.getElementById('selectedTime');

selectedTime.textContent = timeScale.invert(commitProgress).toLocaleString('en', {
  dateStyle: 'long',
  timeStyle: 'short',
});

slider.addEventListener('input', (event) => {
  commitProgress = +event.target.value;
  updateTimeDisplay()
});
let filteredCommits = [];

function filterCommitsByTime() {
  const commitMaxTime = timeScale.invert(commitProgress);
  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
}
let colors = d3.scaleOrdinal(d3.schemeTableau10);
  function updateFileDisplay(filteredCommits) {
    const lines = filteredCommits.flatMap(d => d.lines);
    const files = d3.groups(lines, d => d.file)
      .map(([name, lines]) => ({ name, lines }))
      .sort((a, b) => b.lines.length - a.lines.length);
  
    const filesContainer = d3.select('#files')
      .selectAll('div')
      .data(files, d => d.name)
      .join(
        enter =>
          enter.append('div').call(div => {
            div.append('dt').append('code');
            div.append('dd');
          })
      );
    
    filesContainer.select('dt')
    .html(d => `<code>${d.name}</code> <small>${d.lines.length} lines</small>`);
    
    filesContainer.select('dd')
    .selectAll('div')
    .data(d => d.lines)
    .join('div')
    .attr('class', 'loc')
    .attr('style', d => `--color: ${colors(d.type)}`);
  }
  
  function updateTimeDisplay() {
    const commitMaxTime = timeScale.invert(commitProgress);
    selectedTime.textContent = commitMaxTime.toLocaleString('en', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  
    filterCommitsByTime();
    updateScatterPlot(data, filteredCommits);
    updateFileDisplay(filteredCommits); 
    renderCommitInfo(filteredCommits.flatMap(d => d.lines), filteredCommits);
  }
  
renderCommitInfo(data, commits);
updateScatterPlot(data, commits);
d3.select('#scatter-story')
  .selectAll('.step')
  .data(commits)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
		On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
		I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
    }</a>.
		I edited ${d.totalLines} lines across ${
      d3.rollups(
        d.lines,
        (D) => D.length,
        (d) => d.file,
      ).length
    } files.
		Then I looked over all I had made, and I saw that it was very good.
	`,
  );
  function onStepEnter(response) {
    const commit = response.element.__data__;
    commitProgress = timeScale(commit.datetime);
    updateTimeDisplay();
  }
  
  const scroller = scrollama();
  scroller
    .setup({
      container: '#scrolly-1',
      step: '#scrolly-1 .step',
    })
    .onStepEnter(onStepEnter)