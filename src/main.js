// Header Scroll Animation
let lastScrollTop = 0;
const header = document.getElementById('header');
const headerHeight = header.clientHeight;
let isNavigatingToAnchor = false;

window.addEventListener('scroll', showHideHeader);

function showHideHeader() {
  const currentScroll = window.scrollY || document.documentElement.scrollTop;
  if (isNavigatingToAnchor) {
    header.classList.add('hidden');
    return;
  }
  if (currentScroll > headerHeight) {
    if (currentScroll > lastScrollTop) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
      setGlassHeader(currentScroll);
    }
  } else {
    header.classList.remove('hidden');
    setGlassHeader(currentScroll);
  }
  lastScrollTop = currentScroll;
}

function setGlassHeader(scrollY) {
  if (scrollY > 0) {
    header.classList.add('glass');
  } else {
    header.classList.remove('glass');
  }
}

// Listen for hashchange events
window.addEventListener('hashchange', function() {
  isNavigatingToAnchor = true;
});

// Add click event listener to all anchor tags
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function() {
    // Set the flag to true to indicate navigation scroll is starting
    isNavigatingToAnchor = true;
  });
});

// debounce function to include a callback for when the timer starts
function debounce(func, wait, onStart) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    if (!timeout && onStart) onStart();
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

// function to check for anchor navigation
function onScrollStop() {
  if (isNavigatingToAnchor) {
    // Reset the flag
    isNavigatingToAnchor = false;
  }
}

// Attach the scroll event listener with the debounce function
window.addEventListener('scroll', debounce(onScrollStop, 200, () => {
  if (isNavigatingToAnchor) {
    return;
  }
  showHideHeader();
}));

// Hero Slider
const heroImages = [
  'imgs/hero-1.png',
  'imgs/hero-2.png',
  'imgs/hero-3.png',
  'imgs/hero-4.png',
  'imgs/hero-5.png'
];

const dishImages = [
  'imgs/dish-1.png',
  'imgs/dish-2.png',
  'imgs/dish-3.png',
  'imgs/dish-4.png',
  'imgs/dish-5.png',
];

let currentIndex = 0;
const heroImage = document.querySelector('.clip-path');
const dishImage = heroImage.nextElementSibling;
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

function showImage(index) {
  heroImage.style.opacity = 0;
  dishImage.style.transform = 'rotate(0deg) scale(0.7)';
  dishImage.style.opacity = 0;
  setTimeout(() => {
      heroImage.style.backgroundImage = `url(${heroImages[index]})`;
      heroImage.style.opacity = 1;

      dishImage.src = dishImages[index];
      dishImage.style.transform = 'rotate(15deg) scale(1)';
      dishImage.style.opacity = 1;
  }, 500);
}

// Interval for auto slide

function setSliderInterval(milliseconds) {
  return setInterval(() => {
    currentIndex = (currentIndex + 1) % heroImages.length;
    showImage(currentIndex);
  }, milliseconds);
}

let autoSlideInterval = setSliderInterval(5000);

prevButton.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + heroImages.length) % heroImages.length;
  showImage(currentIndex);
  clearInterval(autoSlideInterval);
  autoSlideInterval = setSliderInterval(5000);
});

nextButton.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % heroImages.length;
  showImage(currentIndex);
  clearInterval(autoSlideInterval);
  autoSlideInterval = setSliderInterval(5000);
});

// Fetch Menu Items
insertMenuItemsHtml();

async function fetchMenuItems() {
  const response = await fetch("json/menu.json");
  const data = await response.json();
  return data;
}

function generateMenuItemsHtml(menuItems) {
  let html = "";
  menuItems.forEach((menuItem, index) => {
    html += `
          <div class="dish">
            <img src="${menuItem.img}" alt="${menuItem.name}">
            <h6>${menuItem.name}</h6>
            <p class="desc">${menuItem.description}</p>
            <p class="price flex center">${menuItem.price}$</p>
          </div>`;
  });

  return html;
}

async function insertMenuItemsHtml() {
  const menuItems = await fetchMenuItems();
  const menuItemsHtml = generateMenuItemsHtml(menuItems);

  const menuContainer = document.querySelector('.menu .dishes');
  menuContainer.innerHTML = menuItemsHtml;

  const dishes = Array.from(menuContainer.children);
  let activeDish = dishes[0];
  activeDish.classList.add('active');
  dishes.forEach((dish) => {
    dish.addEventListener('click', () => {
      // Reset active dish
      activeDish.classList.remove('active');
      activeDish = dish;
      dish.classList.add('active');
    });
  });
  observeMenuDishes(dishes);
}

// observe the intersection of Menu Dishes
function observeMenuDishes(dishes) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        entry.target.querySelector('img').style.transform = 'scale(1)';
      } else {
        entry.target.style.opacity = 0;
        entry.target.style.transform = 'translateY(40px)';
        entry.target.querySelector('img').style.transform = 'scale(0.5)';
      }
    });
  }, { threshold: 0.2 });
  
  dishes.forEach(dish => {
    observer.observe(dish);
  });
}


// Fetch Ratings
insertRatingsHtml();
let dots, activeDot;

async function fetchRatings() {
  const response = await fetch("json/ratings.json");
  const data = await response.json();
  return data;
}

function generateRatingsHtml(ratings) {
  let html = "";
  ratings.forEach((rating, index) => {
    rating.avatar = `/imgs/avatar-${index + 1}.png`
    html += `
          <div class="rating">
            <img src="${rating.avatar}" alt="Profile Avatar" width="109">
            <div class="stars flex center-x">
              ${`<svg viewBox="0 0 18 18" width="18" fill="#FB0"><use href="#star" /></svg>`.repeat(rating.stars)}
              ${`<svg viewBox="0 0 18 18" width="18" fill="#DDD"><use href="#star" /></svg>`.repeat(5 - rating.stars)}
            </div>
            <div class="wrapper">
              <p>${rating.comment}</p>
              <h6>${rating.username}</h6>
              <p>${rating.job}</p>
            </div>
          </div>`
  });

  return html;
}

async function insertRatingsHtml() {
  const ratings = await fetchRatings();
  const ratingsHtml = generateRatingsHtml(ratings);

  const ratingsContainer = document.querySelector('.ratings .content');
  ratingsContainer.innerHTML = ratingsHtml;

  let autoSlideInterval = setInterval(nextRating, 3000);
  dots = Array.from({length: ratingsContainer.children.length}, () => createElement('button', 'dot'));
  dots[0].classList.add('active');
  activeDot = dots[0];
  dots.forEach((dot, index) => {
    ratingsContainer.nextElementSibling.insertAdjacentElement('beforeend', dot);
    // Listen for click event on each dot
    dot.addEventListener('click', () => {
      setActiveDot(dot);
      showRating(index);
      // Reset the auto slide interval to wait 3s from now
      clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(nextRating, 3000);
    })
  });
}

function setActiveDot(dot) {
  activeDot.classList.remove('active');
  activeDot = dot;
  activeDot.classList.add('active');
}

// Silder Functionality for Ratings
let currentRating = 0;

function showRating(index) {
  const ratings = document.querySelector('.ratings .content');
  const children = ratings.children;
  if (index >= children.length) {
    currentRating = 0;
  } else if (index < 0) {
    currentRating = children.length - 1;
  } else {
    currentRating = index;
  }
  // get rating width
  const ratingWidth = children[0].clientWidth / 16;

  // get ratings gap property
  const gapProperty = window.getComputedStyle(ratings).getPropertyValue('gap');
  const gapValue = parseInt(gapProperty, 10) / 16;
  
  ratings.style.transform = `translateX(${(currentRating * -1 * (ratingWidth + gapValue))}rem)`;
}

function nextRating() {
  showRating(currentRating + 1);
  setActiveDot(dots[currentRating]);
}

function createElement(tagName, className) {
  const newElement = document.createElement(tagName);
  newElement.className = className ?? '';
  return newElement;
}

// Validate Email Input
const form = document.querySelector('#subscribe form');
const emailInput = form.querySelector('#email');
const emailWrapper = emailInput.parentElement;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = emailInput.value;
  if (validateEmail(email)) {
    emailWrapper.classList.remove('invalid');
    emailWrapper.removeAttribute('data-message');
    // send email as get request
    window.location.href = `${window.location.origin}/?email=${email}`;
  } else {
    emailWrapper.classList.add('invalid');
    emailWrapper.setAttribute('data-message', 'Invalid email address!');
  }
});

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
