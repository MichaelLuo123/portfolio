console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";       // GitHub Pages repo name

let pages = [
    { url: "index.html", title: "Home" },
    { url: "projects/index.html", title: "Projects" },
    { url: "contact/index.html", title: "Contact" },
    { url: "cv.html", title: "Resume" },
    { url: "https://github.com/michaelluo123", title: "GitHub" }, 
  ];
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
);
const select = document.querySelector('.color-scheme select');
function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty("color-scheme", colorScheme);
    select.value = colorScheme;
  }
  
 
if ("colorScheme" in localStorage) {
    setColorScheme(localStorage.colorScheme);
} else {
    
    setColorScheme("light dark");
}
  

select.addEventListener("input", function (event) {
    const value = event.target.value;
    console.log("color scheme changed to", value);
    localStorage.colorScheme = value;
    setColorScheme(value);
});
  

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    // Fix URL if it’s a relative path
    if (!url.startsWith("http")) {
        url = BASE_PATH + url;
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
      );
      
    if (a.host !== location.host) {
        a.target = "_blank";
    }
    nav.append(a);
  }
async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    console.log(response); 
  
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!(containerElement instanceof HTMLElement)) {
    console.error('renderProjects error: Invalid container element provided.');
    return;
  }
  if (!Array.isArray(projects)) {
    console.error('renderProjects error: Expected an array of project objects.');
    return;
  }
  const validHeading = /^h[1-6]$/i;
  const headingTag = validHeading.test(headingLevel) ? headingLevel : 'h3';
  containerElement.innerHTML = '';
  projects.forEach(project => {
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingTag}>${project.title || 'Untitled Project'}</${headingTag}>
      <img src="${project.image || 'https://via.placeholder.com/150'}" alt="${project.title || 'Project image'}">
      <p>${project.description || 'No description provided.'}</p>
    `;
    containerElement.appendChild(article);
  });
}
