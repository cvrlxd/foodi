(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function uniqArray(array) {
  return array.filter((item, index, self) => self.indexOf(item) === index);
}
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("data-fls-menu-open")) {
      bodyUnlock();
      document.documentElement.removeAttribute("data-fls-menu-open");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    window.scrollTo({
      top: targetBlockElementPosition,
      behavior: "smooth"
    });
  }
};
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
function headerScroll() {
  const header = document.querySelector("[data-fls-header-scroll]");
  const headerShow = header.hasAttribute("data-fls-header-scroll-show");
  const headerShowTimer = header.dataset.flsHeaderScrollShow ? header.dataset.flsHeaderScrollShow : 500;
  const startPoint = header.dataset.flsHeaderScroll ? header.dataset.flsHeaderScroll : 1;
  let scrollDirection = 0;
  let timer;
  document.addEventListener("scroll", function(e) {
    const scrollTop = window.scrollY;
    clearTimeout(timer);
    if (scrollTop >= startPoint) {
      !header.classList.contains("--header-scroll") ? header.classList.add("--header-scroll") : null;
      if (headerShow) {
        if (scrollTop > scrollDirection) {
          header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
        } else {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }
        timer = setTimeout(() => {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }, headerShowTimer);
      }
    } else {
      header.classList.contains("--header-scroll") ? header.classList.remove("--header-scroll") : null;
      if (headerShow) {
        header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
      }
    }
    scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
  });
}
document.querySelector("[data-fls-header-scroll]") ? window.addEventListener("load", headerScroll) : null;
class ScrollWatcher {
  constructor(props) {
    let defaultConfig = {
      logging: true
    };
    this.config = Object.assign(defaultConfig, props);
    this.observer;
    !document.documentElement.classList.contains("watcher") ? this.scrollWatcherRun() : null;
  }
  // Оновлюємо конструктор
  scrollWatcherUpdate() {
    this.scrollWatcherRun();
  }
  // Запускаємо конструктор
  scrollWatcherRun() {
    document.documentElement.classList.add("watcher");
    this.scrollWatcherConstructor(document.querySelectorAll("[data-fls-watcher]"));
  }
  // Конструктор спостерігачів
  scrollWatcherConstructor(items) {
    if (items.length) {
      let uniqParams = uniqArray(Array.from(items).map(function(item) {
        if (item.dataset.flsWatcher === "navigator" && !item.dataset.flsWatcherThreshold) {
          let valueOfThreshold;
          if (item.clientHeight > 2) {
            valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1);
            if (valueOfThreshold > 1) {
              valueOfThreshold = 1;
            }
          } else {
            valueOfThreshold = 1;
          }
          item.setAttribute(
            "data-fls-watcher-threshold",
            valueOfThreshold.toFixed(2)
          );
        }
        return `${item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null}|${item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px"}|${item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0}`;
      }));
      uniqParams.forEach((uniqParam) => {
        let uniqParamArray = uniqParam.split("|");
        let paramsWatch = {
          root: uniqParamArray[0],
          margin: uniqParamArray[1],
          threshold: uniqParamArray[2]
        };
        let groupItems = Array.from(items).filter(function(item) {
          let watchRoot = item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null;
          let watchMargin = item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px";
          let watchThreshold = item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0;
          if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) {
            return item;
          }
        });
        let configWatcher = this.getScrollWatcherConfig(paramsWatch);
        this.scrollWatcherInit(groupItems, configWatcher);
      });
    }
  }
  // Функція створення налаштувань
  getScrollWatcherConfig(paramsWatch) {
    let configWatcher = {};
    if (document.querySelector(paramsWatch.root)) {
      configWatcher.root = document.querySelector(paramsWatch.root);
    } else if (paramsWatch.root !== "null") ;
    configWatcher.rootMargin = paramsWatch.margin;
    if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) {
      return;
    }
    if (paramsWatch.threshold === "prx") {
      paramsWatch.threshold = [];
      for (let i = 0; i <= 1; i += 5e-3) {
        paramsWatch.threshold.push(i);
      }
    } else {
      paramsWatch.threshold = paramsWatch.threshold.split(",");
    }
    configWatcher.threshold = paramsWatch.threshold;
    return configWatcher;
  }
  // Функція створення нового спостерігача зі своїми налаштуваннями
  scrollWatcherCreate(configWatcher) {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        this.scrollWatcherCallback(entry, observer);
      });
    }, configWatcher);
  }
  // Функція ініціалізації спостерігача зі своїми налаштуваннями
  scrollWatcherInit(items, configWatcher) {
    this.scrollWatcherCreate(configWatcher);
    items.forEach((item) => this.observer.observe(item));
  }
  // Функція обробки базових дій точок спрацьовування
  scrollWatcherIntersecting(entry, targetElement) {
    if (entry.isIntersecting) {
      !targetElement.classList.contains("--watcher-view") ? targetElement.classList.add("--watcher-view") : null;
    } else {
      targetElement.classList.contains("--watcher-view") ? targetElement.classList.remove("--watcher-view") : null;
    }
  }
  // Функція відключення стеження за об'єктом
  scrollWatcherOff(targetElement, observer) {
    observer.unobserve(targetElement);
  }
  // Функція обробки спостереження
  scrollWatcherCallback(entry, observer) {
    const targetElement = entry.target;
    this.scrollWatcherIntersecting(entry, targetElement);
    targetElement.hasAttribute("data-fls-watcher-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
    document.dispatchEvent(new CustomEvent("watcherCallback", {
      detail: {
        entry
      }
    }));
  }
}
document.querySelector("[data-fls-watcher]") ? window.addEventListener("load", () => new ScrollWatcher({})) : null;
function pageNavigation() {
  document.addEventListener("click", pageNavigationAction);
  document.addEventListener("watcherCallback", pageNavigationAction);
  function pageNavigationAction(e) {
    if (e.type === "click") {
      const targetElement = e.target;
      if (targetElement.closest("[data-fls-scrollto]")) {
        const gotoLink = targetElement.closest("[data-fls-scrollto]");
        const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : "";
        const noHeader = gotoLink.hasAttribute("data-fls-scrollto-header") ? true : false;
        const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
        const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
        if (window.fullpage) {
          const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest("[data-fls-fullpage-section]");
          const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
          if (fullpageSectionId !== null) {
            window.fullpage.switchingSection(fullpageSectionId);
            if (document.documentElement.hasAttribute("data-fls-menu-open")) {
              bodyUnlock();
              document.documentElement.removeAttribute("data-fls-menu-open");
            }
          }
        } else {
          gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
        }
        e.preventDefault();
      }
    } else if (e.type === "watcherCallback" && e.detail) {
      const entry = e.detail.entry;
      const targetElement = entry.target;
      if (targetElement.dataset.flsWatcher === "navigator") {
        document.querySelector(`[data-fls-scrollto].--navigator-active`);
        let navigatorCurrentItem;
        if (targetElement.id && document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`)) {
          navigatorCurrentItem = document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`);
        } else if (targetElement.classList.length) {
          for (let index = 0; index < targetElement.classList.length; index++) {
            const element = targetElement.classList[index];
            if (document.querySelector(`[data-fls-scrollto=".${element}"]`)) {
              navigatorCurrentItem = document.querySelector(`[data-fls-scrollto=".${element}"]`);
              break;
            }
          }
        }
        if (entry.isIntersecting) {
          navigatorCurrentItem ? navigatorCurrentItem.classList.add("--navigator-active") : null;
        } else {
          navigatorCurrentItem ? navigatorCurrentItem.classList.remove("--navigator-active") : null;
        }
      }
    }
  }
  if (getHash()) {
    let goToHash;
    if (document.querySelector(`#${getHash()}`)) {
      goToHash = `#${getHash()}`;
    } else if (document.querySelector(`.${getHash()}`)) {
      goToHash = `.${getHash()}`;
    }
    goToHash ? gotoBlock(goToHash) : null;
  }
}
document.querySelector("[data-fls-scrollto]") ? window.addEventListener("load", pageNavigation) : null;
class Parallax {
  constructor(elements) {
    if (elements.length) {
      this.elements = Array.from(elements).map((el) => new Parallax.Each(el, this.options));
    }
  }
  destroyEvents() {
    this.elements.forEach((el) => {
      el.destroyEvents();
    });
  }
  setEvents() {
    this.elements.forEach((el) => {
      el.setEvents();
    });
  }
}
Parallax.Each = class {
  constructor(parent) {
    this.parent = parent;
    this.elements = this.parent.querySelectorAll("[data-fls-parallax]");
    this.animation = this.animationFrame.bind(this);
    this.offset = 0;
    this.value = 0;
    this.smooth = parent.dataset.flsParallaxSmooth ? Number(parent.dataset.flsParallaxSmooth) : 15;
    this.setEvents();
  }
  setEvents() {
    this.animationID = window.requestAnimationFrame(this.animation);
  }
  destroyEvents() {
    window.cancelAnimationFrame(this.animationID);
  }
  animationFrame() {
    const topToWindow = this.parent.getBoundingClientRect().top;
    const heightParent = this.parent.offsetHeight;
    const heightWindow = window.innerHeight;
    const positionParent = {
      top: topToWindow - heightWindow,
      bottom: topToWindow + heightParent
    };
    const centerPoint = this.parent.dataset.flsParallaxCenter ? this.parent.dataset.flsParallaxCenter : "center";
    if (positionParent.top < 30 && positionParent.bottom > -30) {
      switch (centerPoint) {
        // верхній точці (початок батька стикається верхнього краю екрану)
        case "top":
          this.offset = -1 * topToWindow;
          break;
        // центрі екрана (середина батька у середині екрана)
        case "center":
          this.offset = heightWindow / 2 - (topToWindow + heightParent / 2);
          break;
        // Початок: нижня частина екрана = верхня частина батька
        case "bottom":
          this.offset = heightWindow - (topToWindow + heightParent);
          break;
      }
    }
    this.value += (this.offset - this.value) / this.smooth;
    this.animationID = window.requestAnimationFrame(this.animation);
    this.elements.forEach((el) => {
      const parameters = {
        axis: el.dataset.axis ? el.dataset.axis : "v",
        direction: el.dataset.flsParallaxDirection ? el.dataset.flsParallaxDirection + "1" : "-1",
        coefficient: el.dataset.flsParallaxCoefficient ? Number(el.dataset.flsParallaxCoefficient) : 5,
        additionalProperties: el.dataset.flsParallaxProperties ? el.dataset.flsParallaxProperties : ""
      };
      this.parameters(el, parameters);
    });
  }
  parameters(el, parameters) {
    if (parameters.axis == "v") {
      el.style.transform = `translate3D(0, ${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0) ${parameters.additionalProperties}`;
    } else if (parameters.axis == "h") {
      el.style.transform = `translate3D(${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0,0) ${parameters.additionalProperties}`;
    }
  }
};
if (document.querySelector("[data-fls-parallax-parent]")) {
  new Parallax(document.querySelectorAll("[data-fls-parallax-parent]"));
}
