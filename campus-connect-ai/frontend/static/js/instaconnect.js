// Story functionality
document.addEventListener('DOMContentLoaded', () => {
    const stories = document.querySelectorAll('.story');
    const storyViewer = document.querySelector('.story-viewer');
    const storyContent = document.querySelector('#story-content-img');
    const storyUserImg = document.querySelector('#story-user-img');
    const storyUsername = document.querySelector('#story-username');
    const closeButton = document.querySelector('.close-story');
    const progressBarsContainer = document.querySelector('.progress-bars');
    
    let currentStoryTimeout;
    
    function createProgressBars() {
        progressBarsContainer.innerHTML = '';
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress"></div>';
        progressBarsContainer.appendChild(progressBar);
    }

    function showStory(storyElement) {
        const storyRect = storyElement.getBoundingClientRect();
        const centerX = storyRect.left + (storyRect.width / 2);
        const centerY = storyRect.top + (storyRect.height / 2);
        
        storyViewer.style.transformOrigin = `${centerX}px ${centerY}px`;
        
        const storyImg = storyElement.querySelector('img').src;
        const username = storyElement.querySelector('.name').textContent;
        const userImg = storyElement.querySelector('.profile-photo img').src;

        storyContent.src = storyImg;
        storyUserImg.src = userImg;
        storyUsername.textContent = username;
        
        requestAnimationFrame(() => {
            storyViewer.classList.remove('closing');
            storyViewer.classList.add('active');
            
            createProgressBars();
            const progressBar = document.querySelector('.progress-bar');
            progressBar.classList.add('active');
        });
        
        currentStoryTimeout = setTimeout(() => {
            closeStory();
        }, 10000);
    }

    function closeStory() {
        storyViewer.classList.add('closing');
        if (currentStoryTimeout) {
            clearTimeout(currentStoryTimeout);
        }
        
        setTimeout(() => {
            storyViewer.classList.remove('active', 'closing');
        }, 300);
    }

    stories.forEach(story => {
        story.addEventListener('click', () => showStory(story));
    });

    closeButton.addEventListener('click', closeStory);
    
    // Close on background click
    storyViewer.addEventListener('click', (e) => {
        if (e.target === storyViewer) {
            closeStory();
        }
    });
});
