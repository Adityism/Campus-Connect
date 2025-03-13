// Enhanced Notification Slider
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Start the slider
showSlide(0);
setInterval(nextSlide, 4000);

// Calendar Functionality
let currentDate = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarDays = document.getElementById('calendarDays');
    
    monthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    calendarDays.innerHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'other-month');
        calendarDays.appendChild(dayElement);
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = i;
        
        // Highlight today
        const today = new Date();
        if (i === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        calendarDays.appendChild(dayElement);
    }

    // Add empty cells for days after the last day of the month
    const lastDayIndex = lastDay.getDay();
    const remainingDays = 6 - lastDayIndex;
    for (let i = 0; i < remainingDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'other-month');
        calendarDays.appendChild(dayElement);
    }
}

// Initialize calendar on load
document.addEventListener('DOMContentLoaded', renderCalendar);
