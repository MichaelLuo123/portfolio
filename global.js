console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: "https://michaelluo123.github.io/portfolio/index.html", title: "Home" },
    { url: "https://michaelluo123.github.io/portfolio/projects/index.html", title: "Projects" },
    { url: "https://michaelluo123.github.io/portfolio/contact/index.html", title: "Contact" },
    { url: "https://michaelluo123.github.io/portfolio/cv.html", title: "Resume" },
    { url: "https://github.com/michaelluo123", title: "GitHub" }, 
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    nav.insertAdjacentHTML("beforeend", `<a href="${url}">${title}</a>`);
  }