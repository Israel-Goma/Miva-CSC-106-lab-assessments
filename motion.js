class ScrollReveal {
  constructor(selector, options) {
    this.targets = Array.from(document.querySelectorAll(selector));
    this.options = options || { threshold: 0.15 };
  }

  start() {
    if (!this.targets.length) return;

    if (!("IntersectionObserver" in window)) {
      this.targets.forEach((el) => el.classList.add("is-shown"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-shown");
          observer.unobserve(entry.target);
        }
      });
    }, this.options);

    this.targets.forEach((el) => observer.observe(el));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ScrollReveal(".reveal-on-scroll").start();
});
