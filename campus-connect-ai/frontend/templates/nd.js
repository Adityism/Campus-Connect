// InstaConnect JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initPosts();
    initMessages();
    initThemeCustomization();
});

function initNavigation() {
    // Handle navigation menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchUsersAndProjects(query);
            }
        }, 500));
    }

    // Handle notifications popup
    const notificationsMenu = document.querySelector('#notifications');
    if (notificationsMenu) {
        notificationsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.notifications-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Handle messages notifications
    const messagesMenu = document.querySelector('#messages-notifications');
    if (messagesMenu) {
        messagesMenu.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle messages visibility or navigate to messages page
            // This would be implemented based on your app's design
            console.log('Messages clicked');
        });
    }
}

function initPosts() {
    // Handle post creation
    const postForms = document.querySelectorAll('.create-post');
    postForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = this.querySelector('input[type="text"]').value.trim();
            if (content) {
                createPost(content);
                this.reset();
            }
        });
    });

    // Handle post interactions (like, comment, share, bookmark)
    document.querySelectorAll('.feeds').forEach(feed => {
        feed.addEventListener('click', function(e) {
            // Handle both span[data-action] and button.interaction-btn
            const target = e.target.closest('[data-action], .interaction-btn, .bookmark span');
            if (!target) return;
            
            const action = target.getAttribute('data-action') || '';
            const icon = target.querySelector('i');
            
            if (icon.classList.contains('uil-heart') || action === 'like') {
                icon.classList.toggle('liked');
                target.setAttribute('aria-pressed', icon.classList.contains('liked'));
                if (icon.classList.contains('liked')) {
                    icon.style.color = 'var(--color-danger)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-comment-dots') || action === 'comment') {
                const feedItem = target.closest('.feed');
                const commentSection = feedItem.querySelector('.comments-section') || createCommentSection(feedItem);
                const isVisible = commentSection.style.display !== 'none';
                commentSection.style.display = isVisible ? 'none' : 'block';
                target.setAttribute('aria-expanded', !isVisible);
            } else if (icon.classList.contains('uil-bookmark-full')) {
                icon.classList.toggle('bookmarked');
                target.setAttribute('aria-pressed', icon.classList.contains('bookmarked'));
                if (icon.classList.contains('bookmarked')) {
                    icon.style.color = 'var(--color-primary)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-share-alt') || action === 'share') {
                // Implement share functionality
                console.log('Share post');
                // You could open a share modal or implement native sharing
                alert('Sharing this post!');
            }
        });

        // Add keyboard support for interaction buttons
        feed.querySelectorAll('.interaction-btn, [data-action], .bookmark span').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    });

    // Make edit buttons functional
    document.querySelectorAll('.edit').forEach(editButton => {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

function createCommentSection(feedItem) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input">
            <input type="text" placeholder="Add a comment...">
            <button>Post</button>
        </div>
        <div class="comments-list"></div>
    `;

    const commentInput = commentSection.querySelector('input');
    const commentButton = commentSection.querySelector('button');

    commentButton.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            addComment(commentSection, comment);
            commentInput.value = '';
        }
    });

    feedItem.appendChild(commentSection);
    return commentSection;
}

function addComment(commentSection, comment) {
    const commentsList = commentSection.querySelector('.comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <p><b>User</b> ${comment}</p>
        <small class="text-muted">Just now</small>
    `;
    commentsList.appendChild(commentElement);
}

function initThemeCustomization() {
    const themeButton = document.querySelector('#theme');
    const themeModal = document.querySelector('.customize-theme');
    const fontSizes = document.querySelectorAll('.choose-size span');
    const colorPalette = document.querySelectorAll('.choose-color span');
    const bgColors = document.querySelectorAll('.choose-bg div');
    const root = document.querySelector(':root');
    
    // Open modal
    themeButton.addEventListener('click', function() {
        themeModal.style.display = 'grid';
    });

    // Close modal when clicking outside the card
    themeModal.addEventListener('click', function(e) {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    // Font sizes
    fontSizes.forEach(size => {
        size.addEventListener('click', () => {
            fontSizes.forEach(s => s.classList.remove('active'));
            size.classList.add('active');
            let fontSize;
            if (size.classList.contains('font-size-1')) fontSize = '10px';
            if (size.classList.contains('font-size-2')) fontSize = '13px';
            if (size.classList.contains('font-size-3')) fontSize = '16px';
            if (size.classList.contains('font-size-4')) fontSize = '19px';
            if (size.classList.contains('font-size-5')) fontSize = '22px';
            document.querySelector('html').style.fontSize = fontSize;
            
            // Save to localStorage
            localStorage.setItem('fontSize', fontSize);
        });
    });

    // Colors
    colorPalette.forEach(color => {
        color.addEventListener('click', () => {
            colorPalette.forEach(c => c.classList.remove('active'));
            color.classList.add('active');
            let primaryHue;
            if (color.classList.contains('color-1')) primaryHue = 252;
            if (color.classList.contains('color-2')) primaryHue = 52;
            if (color.classList.contains('color-3')) primaryHue = 352;
            if (color.classList.contains('color-4')) primaryHue = 152;
            if (color.classList.contains('color-5')) primaryHue = 202;
            root.style.setProperty('--primary-color-hue', primaryHue);
            
            // Save to localStorage
            localStorage.setItem('primaryHue', primaryHue);
        });
    });
    
    // Background colors
    if (bgColors && bgColors.length > 0) {
        bgColors.forEach(bg => {
            bg.addEventListener('click', () => {
                bgColors.forEach(b => b.classList.remove('active'));
                bg.classList.add('active');
                let darkColorLightness;
                let lightColorLightness;
                let whiteColorLightness;
                
                if (bg.classList.contains('bg-1')) {
                    // Light theme
                    darkColorLightness = '17%';
                    lightColorLightness = '95%';
                    whiteColorLightness = '100%';
                } else if (bg.classList.contains('bg-2')) {
                    // Dim theme
                    darkColorLightness = '95%';
                    lightColorLightness = '15%';
                    whiteColorLightness = '20%';
                } else if (bg.classList.contains('bg-3')) {
                    // Dark theme
                    darkColorLightness = '95%';
                    lightColorLightness = '0%';
                    whiteColorLightness = '10%';
                }
                
                root.style.setProperty('--light-color-lightness', lightColorLightness);
                root.style.setProperty('--dark-color-lightness', darkColorLightness);
                root.style.setProperty('--white-color-lightness', whiteColorLightness);
                
                // Save to localStorage
                localStorage.setItem('darkColorLightness', darkColorLightness);
                localStorage.setItem('lightColorLightness', lightColorLightness);
                localStorage.setItem('whiteColorLightness', whiteColorLightness);
            });
        });
    }
    
    // Load saved settings from localStorage
    function loadSavedSettings() {
        const savedFontSize = localStorage.getItem('fontSize');
        const savedPrimaryHue = localStorage.getItem('primaryHue');
        const savedDarkColorLightness = localStorage.getItem('darkColorLightness');
        const savedLightColorLightness = localStorage.getItem('lightColorLightness');
        const savedWhiteColorLightness = localStorage.getItem('whiteColorLightness');
        
        if (savedFontSize) {
            document.querySelector('html').style.fontSize = savedFontSize;
            fontSizes.forEach(size => {
                size.classList.remove('active');
                if (size.classList.contains(`font-size-${getFontSizeIndex(savedFontSize)}`)) {
                    size.classList.add('active');
                }
            });
        }
        
        if (savedPrimaryHue) {
            root.style.setProperty('--primary-color-hue', savedPrimaryHue);
            colorPalette.forEach(color => {
                color.classList.remove('active');
                if (getColorIndex(savedPrimaryHue) > 0 && 
                    color.classList.contains(`color-${getColorIndex(savedPrimaryHue)}`)) {
                    color.classList.add('active');
                }
            });
        }
        
        if (savedDarkColorLightness && savedLightColorLightness && savedWhiteColorLightness) {
            root.style.setProperty('--dark-color-lightness', savedDarkColorLightness);
            root.style.setProperty('--light-color-lightness', savedLightColorLightness);
            root.style.setProperty('--white-color-lightness', savedWhiteColorLightness);
            
            if (bgColors && bgColors.length > 0) {
                bgColors.forEach(bg => {
                    bg.classList.remove('active');
                    if (getBgIndex(savedLightColorLightness) > 0 && 
                        bg.classList.contains(`bg-${getBgIndex(savedLightColorLightness)}`)) {
                        bg.classList.add('active');
                    }
                });
            }
        }
    }
    
    function getFontSizeIndex(fontSize) {
        switch(fontSize) {
            case '10px': return 1;
            case '13px': return 2;
            case '16px': return 3;
            case '19px': return 4;
            case '22px': return 5;
            default: return 3;
        }
    }
    
    function getColorIndex(hue) {
        switch(parseInt(hue)) {
            case 252: return 1;
            case 52: return 2;
            case 352: return 3;
            case 152: return 4;
            case 202: return 5;
            default: return 1;
        }
    }
    
    function getBgIndex(lightColorLightness) {
        switch(lightColorLightness) {
            case '95%': return 1; // Light theme
            case '15%': return 2; // Dim theme
            case '0%': return 3;  // Dark theme
            default: return 1;
        }
    }
    
    // Load saved settings when page loads
    loadSavedSettings();
}

function initMessages() {
    // Handle message search
    const messageSearch = document.querySelector('#message-search');
    messageSearch.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim();
        if (query.length > 2) {
            searchMessages(query);
        }
    }, 500));
}

// This function is now merged with the main initThemeCustomization function above

// API Functions
async function searchUsersAndProjects(query) {
    try {
        // For demo purposes, we'll create mock search results
        console.log('Searching for:', query);
        const mockResults = [
            { name: 'John Doe', avatar: '../static/images/male.png', description: 'Computer Science Student' },
            { name: 'Jane Smith', avatar: '../static/images/female.png', description: 'Data Science Researcher' },
            { name: 'AI Project', avatar: null, description: 'Machine Learning Project' }
        ];
        
        // Filter results based on query
        const filteredResults = mockResults.filter(result => 
            result.name.toLowerCase().includes(query.toLowerCase()) || 
            (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        updateSearchResults({ results: filteredResults });
    } catch (error) {
        console.error('Search error:', error);
    }
}

async function createPost(content) {
    try {
        // For demo purposes, we'll create a mock post
        console.log('Creating post with content:', content);
        const mockPost = {
            id: Date.now(),
            content: content,
            author: {
                name: 'Current User',
                avatar: '../static/images/male.png'
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        addPostToFeed(mockPost);
        return { success: true, post: mockPost };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, error: error.message };
    }
}

async function searchMessages(query) {
    try {
        // For demo purposes, we'll create mock message results
        console.log('Searching messages for:', query);
        const mockMessages = [
            { 
                id: 1, 
                content: 'Hello there!', 
                author: { name: 'John Doe', avatar: '../static/images/male.png' },
                timestamp: '2023-05-15T10:30:00Z'
            },
            { 
                id: 2, 
                content: 'How are you doing?', 
                author: { name: 'Jane Smith', avatar: '../static/images/female.png' },
                timestamp: '2023-05-15T11:45:00Z'
            }
        ];
        
        // Filter messages based on query
        const filteredMessages = mockMessages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );
        
        updateMessages(filteredMessages);
    } catch (error) {
        console.error('Message search error:', error);
    }
}

// UI Update Functions
function addPostToFeed(post) {
    const feed = document.querySelector('.feeds');
    const postElement = document.createElement('div');
    postElement.className = 'feed';
    postElement.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${post.author.avatar || '../static/images/male.png'}" alt="${post.author.name}">
                </div>
                <div class="info">
                    <h3>${post.author.name}</h3>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="photo">
            ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span data-action="like"><i class="uil uil-heart"></i></span>
                <span data-action="comment"><i class="uil uil-comment-dots"></i></span>
                <span data-action="share"><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <p>Be the first to like this</p>
        </div>
        <div class="comments text-muted">
            No comments yet
        </div>
    `;
    
    // Add the new post at the beginning of the feed
    feed.insertBefore(postElement, feed.firstChild);
    
    // Add event listeners to the new post's buttons
    const editButton = postElement.querySelector('.edit');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    return postElement;
}

function updateSearchResults(data) {
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.position = 'absolute';
    searchResults.style.top = '100%';
    searchResults.style.left = '0';
    searchResults.style.width = '100%';
    searchResults.style.backgroundColor = 'var(--color-white)';
    searchResults.style.borderRadius = 'var(--card-border-radius)';
    searchResults.style.boxShadow = '0 0 1rem var(--color-primary)';
    searchResults.style.zIndex = '10';
    searchResults.style.padding = '1rem';
    
    // Remove any existing search results
    document.querySelectorAll('.search-results').forEach(el => el.remove());
    
    if (data.results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
    } else {
        data.results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.style.display = 'flex';
            resultElement.style.alignItems = 'center';
            resultElement.style.gap = '1rem';
            resultElement.style.padding = '0.5rem';
            resultElement.style.borderBottom = '1px solid var(--color-light)';
            resultElement.style.cursor = 'pointer';
            
            resultElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${result.avatar || '../static/images/male.png'}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <h4>${result.name}</h4>
                    <p class="text-muted">${result.description || ''}</p>
                </div>
            `;
            
            resultElement.addEventListener('click', () => {
                console.log('Selected result:', result);
                searchResults.remove();
            });
            
            searchResults.appendChild(resultElement);
        });
    }
    
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.position = 'relative';
    searchBar.appendChild(searchResults);
}

function updateMessages(data) {
    // Create a messages container if it doesn't exist
    let messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '1rem';
        messagesContainer.style.right = '1rem';
        messagesContainer.style.width = '300px';
        messagesContainer.style.backgroundColor = 'var(--color-white)';
        messagesContainer.style.borderRadius = 'var(--card-border-radius)';
        messagesContainer.style.boxShadow = '0 0 1rem var(--color-primary)';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.overflow = 'hidden';
        
        const header = document.createElement('div');
        header.className = 'messages-header';
        header.style.padding = '1rem';
        header.style.borderBottom = '1px solid var(--color-light)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h3>Messages</h3>
            <span class="close-messages"><i class="uil uil-times"></i></span>
        `;
        
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        messagesList.style.maxHeight = '300px';
        messagesList.style.overflowY = 'auto';
        messagesList.style.padding = '1rem';
        
        messagesContainer.appendChild(header);
        messagesContainer.appendChild(messagesList);
        document.body.appendChild(messagesContainer);
        
        // Add event listener to close button
        header.querySelector('.close-messages').addEventListener('click', () => {
            messagesContainer.style.display = 'none';
        });
    } else {
        messagesContainer.style.display = 'block';
    }
    
    const messagesList = messagesContainer.querySelector('.messages-list');
    messagesList.innerHTML = '';
    
    if (data.length === 0) {
        messagesList.innerHTML = '<p class="text-muted">No messages found</p>';
    } else {
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.style.display = 'flex';
            messageElement.style.gap = '1rem';
            messageElement.style.marginBottom = '1rem';
            messageElement.style.padding = '0.5rem';
            messageElement.style.borderBottom = '1px solid var(--color-light)';
            
            messageElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${message.author.avatar || '../static/images/male.png'}" alt="${message.author.name}">
                </div>
                <div class="message-content">
                    <h4>${message.author.name}</h4>
                    <p>${message.content}</p>
                    <small class="text-muted">${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
            
            messagesList.appendChild(messageElement);
        });
    }
}

function addPostToFeed(post) {
    const feed = document.querySelector('.feeds');
    const postElement = document.createElement('div');
    postElement.className = 'feed';
    postElement.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${post.author.avatar || '../static/images/male.png'}" alt="${post.author.name}">
                </div>
                <div class="info">
                    <h3>${post.author.name}</h3>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="photo">
            ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span data-action="like"><i class="uil uil-heart"></i></span>
                <span data-action="comment"><i class="uil uil-comment-dots"></i></span>
                <span data-action="share"><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <p>Be the first to like this</p>
        </div>
        <div class="comments text-muted">
            No comments yet
        </div>
    `;
    
    // Add the new post at the beginning of the feed
    feed.insertBefore(postElement, feed.firstChild);
    
    // Add event listeners to the new post's buttons
    const editButton = postElement.querySelector('.edit');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    return postElement;
}

function updateMessages(data) {
    // Create a messages container if it doesn't exist
    let messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '1rem';
        messagesContainer.style.right = '1rem';
        messagesContainer.style.width = '300px';
        messagesContainer.style.backgroundColor = 'var(--color-white)';
        messagesContainer.style.borderRadius = 'var(--card-border-radius)';
        messagesContainer.style.boxShadow = '0 0 1rem var(--color-primary)';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.overflow = 'hidden';
        
        const header = document.createElement('div');
        header.className = 'messages-header';
        header.style.padding = '1rem';
        header.style.borderBottom = '1px solid var(--color-light)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h3>Messages</h3>
            <span class="close-messages"><i class="uil uil-times"></i></span>
        `;
        
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        messagesList.style.maxHeight = '300px';
        messagesList.style.overflowY = 'auto';
        messagesList.style.padding = '1rem';
        
        messagesContainer.appendChild(header);
        messagesContainer.appendChild(messagesList);
        document.body.appendChild(messagesContainer);
        
        // Add event listener to close button
        header.querySelector('.close-messages').addEventListener('click', () => {
            messagesContainer.style.display = 'none';
        });
    } else {
        messagesContainer.style.display = 'block';
    }
    
    const messagesList = messagesContainer.querySelector('.messages-list');
    messagesList.innerHTML = '';
    
    if (data.length === 0) {
        messagesList.innerHTML = '<p class="text-muted">No messages found</p>';
    } else {
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.style.display = 'flex';
            messageElement.style.gap = '1rem';
            messageElement.style.marginBottom = '1rem';
            messageElement.style.padding = '0.5rem';
            messageElement.style.borderBottom = '1px solid var(--color-light)';
            
            messageElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${message.author.avatar || '../static/images/male.png'}" alt="${message.author.name}">
                </div>
                <div class="message-content">
                    <h4>${message.author.name}</h4>
                    <p>${message.content}</p>
                    <small class="text-muted">${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
            
            messagesList.appendChild(messageElement);
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}// InstaConnect JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initPosts();
    initMessages();
    initThemeCustomization();
});

function initNavigation() {
    // Handle navigation menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchUsersAndProjects(query);
            }
        }, 500));
    }

    // Handle notifications popup
    const notificationsMenu = document.querySelector('#notifications');
    if (notificationsMenu) {
        notificationsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.notifications-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Handle messages notifications
    const messagesMenu = document.querySelector('#messages-notifications');
    if (messagesMenu) {
        messagesMenu.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle messages visibility or navigate to messages page
            // This would be implemented based on your app's design
            console.log('Messages clicked');
        });
    }
}

function initPosts() {
    // Handle post creation
    const postForms = document.querySelectorAll('.create-post');
    postForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = this.querySelector('input[type="text"]').value.trim();
            if (content) {
                createPost(content);
                this.reset();
            }
        });
    });

    // Handle post interactions (like, comment, share, bookmark)
    document.querySelectorAll('.feeds').forEach(feed => {
        feed.addEventListener('click', function(e) {
            // Handle both span[data-action] and button.interaction-btn
            const target = e.target.closest('[data-action], .interaction-btn, .bookmark span');
            if (!target) return;
            
            const action = target.getAttribute('data-action') || '';
            const icon = target.querySelector('i');
            
            if (icon.classList.contains('uil-heart') || action === 'like') {
                icon.classList.toggle('liked');
                target.setAttribute('aria-pressed', icon.classList.contains('liked'));
                if (icon.classList.contains('liked')) {
                    icon.style.color = 'var(--color-danger)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-comment-dots') || action === 'comment') {
                const feedItem = target.closest('.feed');
                const commentSection = feedItem.querySelector('.comments-section') || createCommentSection(feedItem);
                const isVisible = commentSection.style.display !== 'none';
                commentSection.style.display = isVisible ? 'none' : 'block';
                target.setAttribute('aria-expanded', !isVisible);
            } else if (icon.classList.contains('uil-bookmark-full')) {
                icon.classList.toggle('bookmarked');
                target.setAttribute('aria-pressed', icon.classList.contains('bookmarked'));
                if (icon.classList.contains('bookmarked')) {
                    icon.style.color = 'var(--color-primary)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-share-alt') || action === 'share') {
                // Implement share functionality
                console.log('Share post');
                // You could open a share modal or implement native sharing
                alert('Sharing this post!');
            }
        });

        // Add keyboard support for interaction buttons
        feed.querySelectorAll('.interaction-btn, [data-action], .bookmark span').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    });

    // Make edit buttons functional
    document.querySelectorAll('.edit').forEach(editButton => {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

function createCommentSection(feedItem) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input">
            <input type="text" placeholder="Add a comment...">
            <button>Post</button>
        </div>
        <div class="comments-list"></div>
    `;

    const commentInput = commentSection.querySelector('input');
    const commentButton = commentSection.querySelector('button');

    commentButton.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            addComment(commentSection, comment);
            commentInput.value = '';
        }
    });

    feedItem.appendChild(commentSection);
    return commentSection;
}

function addComment(commentSection, comment) {
    const commentsList = commentSection.querySelector('.comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <p><b>User</b> ${comment}</p>
        <small class="text-muted">Just now</small>
    `;
    commentsList.appendChild(commentElement);
}

function initThemeCustomization() {
    const themeButton = document.querySelector('#theme');
    const themeModal = document.querySelector('.customize-theme');
    const fontSizes = document.querySelectorAll('.choose-size span');
    const colorPalette = document.querySelectorAll('.choose-color span');
    const bgColors = document.querySelectorAll('.choose-bg div');
    const root = document.querySelector(':root');
    
    // Open modal
    themeButton.addEventListener('click', function() {
        themeModal.style.display = 'grid';
    });

    // Close modal when clicking outside the card
    themeModal.addEventListener('click', function(e) {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    // Font sizes
    fontSizes.forEach(size => {
        size.addEventListener('click', () => {
            fontSizes.forEach(s => s.classList.remove('active'));
            size.classList.add('active');
            let fontSize;
            if (size.classList.contains('font-size-1')) fontSize = '10px';
            if (size.classList.contains('font-size-2')) fontSize = '13px';
            if (size.classList.contains('font-size-3')) fontSize = '16px';
            if (size.classList.contains('font-size-4')) fontSize = '19px';
            if (size.classList.contains('font-size-5')) fontSize = '22px';
            document.querySelector('html').style.fontSize = fontSize;
            
            // Save to localStorage
            localStorage.setItem('fontSize', fontSize);
        });
    });

    // Colors
    colorPalette.forEach(color => {
        color.addEventListener('click', () => {
            colorPalette.forEach(c => c.classList.remove('active'));
            color.classList.add('active');
            let primaryHue;
            if (color.classList.contains('color-1')) primaryHue = 252;
            if (color.classList.contains('color-2')) primaryHue = 52;
            if (color.classList.contains('color-3')) primaryHue = 352;
            if (color.classList.contains('color-4')) primaryHue = 152;
            if (color.classList.contains('color-5')) primaryHue = 202;
            root.style.setProperty('--primary-color-hue', primaryHue);
            
            // Save to localStorage
            localStorage.setItem('primaryHue', primaryHue);
        });
    });
    
    // Background colors
    if (bgColors && bgColors.length > 0) {
        bgColors.forEach(bg => {
            bg.addEventListener('click', () => {
                bgColors.forEach(b => b.classList.remove('active'));
                bg.classList.add('active');
                let darkColorLightness;
                let lightColorLightness;
                let whiteColorLightness;
                
                if (bg.classList.contains('bg-1')) {
                    // Light theme
                    darkColorLightness = '17%';
                    lightColorLightness = '95%';
                    whiteColorLightness = '100%';
                } else if (bg.classList.contains('bg-2')) {
                    // Dim theme
                    darkColorLightness = '95%';
                    lightColorLightness = '15%';
                    whiteColorLightness = '20%';
                } else if (bg.classList.contains('bg-3')) {
                    // Dark theme
                    darkColorLightness = '95%';
                    lightColorLightness = '0%';
                    whiteColorLightness = '10%';
                }
                
                root.style.setProperty('--light-color-lightness', lightColorLightness);
                root.style.setProperty('--dark-color-lightness', darkColorLightness);
                root.style.setProperty('--white-color-lightness', whiteColorLightness);
                
                // Save to localStorage
                localStorage.setItem('darkColorLightness', darkColorLightness);
                localStorage.setItem('lightColorLightness', lightColorLightness);
                localStorage.setItem('whiteColorLightness', whiteColorLightness);
            });
        });
    }
    
    // Load saved settings from localStorage
    function loadSavedSettings() {
        const savedFontSize = localStorage.getItem('fontSize');
        const savedPrimaryHue = localStorage.getItem('primaryHue');
        const savedDarkColorLightness = localStorage.getItem('darkColorLightness');
        const savedLightColorLightness = localStorage.getItem('lightColorLightness');
        const savedWhiteColorLightness = localStorage.getItem('whiteColorLightness');
        
        if (savedFontSize) {
            document.querySelector('html').style.fontSize = savedFontSize;
            fontSizes.forEach(size => {
                size.classList.remove('active');
                if (size.classList.contains(`font-size-${getFontSizeIndex(savedFontSize)}`)) {
                    size.classList.add('active');
                }
            });
        }
        
        if (savedPrimaryHue) {
            root.style.setProperty('--primary-color-hue', savedPrimaryHue);
            colorPalette.forEach(color => {
                color.classList.remove('active');
                if (getColorIndex(savedPrimaryHue) > 0 && 
                    color.classList.contains(`color-${getColorIndex(savedPrimaryHue)}`)) {
                    color.classList.add('active');
                }
            });
        }
        
        if (savedDarkColorLightness && savedLightColorLightness && savedWhiteColorLightness) {
            root.style.setProperty('--dark-color-lightness', savedDarkColorLightness);
            root.style.setProperty('--light-color-lightness', savedLightColorLightness);
            root.style.setProperty('--white-color-lightness', savedWhiteColorLightness);
            
            if (bgColors && bgColors.length > 0) {
                bgColors.forEach(bg => {
                    bg.classList.remove('active');
                    if (getBgIndex(savedLightColorLightness) > 0 && 
                        bg.classList.contains(`bg-${getBgIndex(savedLightColorLightness)}`)) {
                        bg.classList.add('active');
                    }
                });
            }
        }
    }
    
    function getFontSizeIndex(fontSize) {
        switch(fontSize) {
            case '10px': return 1;
            case '13px': return 2;
            case '16px': return 3;
            case '19px': return 4;
            case '22px': return 5;
            default: return 3;
        }
    }
    
    function getColorIndex(hue) {
        switch(parseInt(hue)) {
            case 252: return 1;
            case 52: return 2;
            case 352: return 3;
            case 152: return 4;
            case 202: return 5;
            default: return 1;
        }
    }
    
    function getBgIndex(lightColorLightness) {
        switch(lightColorLightness) {
            case '95%': return 1; // Light theme
            case '15%': return 2; // Dim theme
            case '0%': return 3;  // Dark theme
            default: return 1;
        }
    }
    
    // Load saved settings when page loads
    loadSavedSettings();
}

function initMessages() {
    // Handle message search
    const messageSearch = document.querySelector('#message-search');
    messageSearch.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim();
        if (query.length > 2) {
            searchMessages(query);
        }
    }, 500));
}

// This function is now merged with the main initThemeCustomization function above

// API Functions
async function searchUsersAndProjects(query) {
    try {
        // For demo purposes, we'll create mock search results
        console.log('Searching for:', query);
        const mockResults = [
            { name: 'John Doe', avatar: '../static/images/male.png', description: 'Computer Science Student' },
            { name: 'Jane Smith', avatar: '../static/images/female.png', description: 'Data Science Researcher' },
            { name: 'AI Project', avatar: null, description: 'Machine Learning Project' }
        ];
        
        // Filter results based on query
        const filteredResults = mockResults.filter(result => 
            result.name.toLowerCase().includes(query.toLowerCase()) || 
            (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        updateSearchResults({ results: filteredResults });
    } catch (error) {
        console.error('Search error:', error);
    }
}

async function createPost(content) {
    try {
        // For demo purposes, we'll create a mock post
        console.log('Creating post with content:', content);
        const mockPost = {
            id: Date.now(),
            content: content,
            author: {
                name: 'Current User',
                avatar: '../static/images/male.png'
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        addPostToFeed(mockPost);
        return { success: true, post: mockPost };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, error: error.message };
    }
}

async function searchMessages(query) {
    try {
        // For demo purposes, we'll create mock message results
        console.log('Searching messages for:', query);
        const mockMessages = [
            { 
                id: 1, 
                content: 'Hello there!', 
                author: { name: 'John Doe', avatar: '../static/images/male.png' },
                timestamp: '2023-05-15T10:30:00Z'
            },
            { 
                id: 2, 
                content: 'How are you doing?', 
                author: { name: 'Jane Smith', avatar: '../static/images/female.png' },
                timestamp: '2023-05-15T11:45:00Z'
            }
        ];
        
        // Filter messages based on query
        const filteredMessages = mockMessages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );
        
        updateMessages(filteredMessages);
    } catch (error) {
        console.error('Message search error:', error);
    }
}

// UI Update Functions
function addPostToFeed(post) {
    const feed = document.querySelector('.feeds');
    const postElement = document.createElement('div');
    postElement.className = 'feed';
    postElement.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${post.author.avatar || '../static/images/male.png'}" alt="${post.author.name}">
                </div>
                <div class="info">
                    <h3>${post.author.name}</h3>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="photo">
            ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span data-action="like"><i class="uil uil-heart"></i></span>
                <span data-action="comment"><i class="uil uil-comment-dots"></i></span>
                <span data-action="share"><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <p>Be the first to like this</p>
        </div>
        <div class="comments text-muted">
            No comments yet
        </div>
    `;
    
    // Add the new post at the beginning of the feed
    feed.insertBefore(postElement, feed.firstChild);
    
    // Add event listeners to the new post's buttons
    const editButton = postElement.querySelector('.edit');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    return postElement;
}

function updateSearchResults(data) {
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.position = 'absolute';
    searchResults.style.top = '100%';
    searchResults.style.left = '0';
    searchResults.style.width = '100%';
    searchResults.style.backgroundColor = 'var(--color-white)';
    searchResults.style.borderRadius = 'var(--card-border-radius)';
    searchResults.style.boxShadow = '0 0 1rem var(--color-primary)';
    searchResults.style.zIndex = '10';
    searchResults.style.padding = '1rem';
    
    // Remove any existing search results
    document.querySelectorAll('.search-results').forEach(el => el.remove());
    
    if (data.results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
    } else {
        data.results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.style.display = 'flex';
            resultElement.style.alignItems = 'center';
            resultElement.style.gap = '1rem';
            resultElement.style.padding = '0.5rem';
            resultElement.style.borderBottom = '1px solid var(--color-light)';
            resultElement.style.cursor = 'pointer';
            
            resultElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${result.avatar || '../static/images/male.png'}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <h4>${result.name}</h4>
                    <p class="text-muted">${result.description || ''}</p>
                </div>
            `;
            
            resultElement.addEventListener('click', () => {
                console.log('Selected result:', result);
                searchResults.remove();
            });
            
            searchResults.appendChild(resultElement);
        });
    }
    
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.position = 'relative';
    searchBar.appendChild(searchResults);
}

function updateMessages(data) {
    // Create a messages container if it doesn't exist
    let messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '1rem';
        messagesContainer.style.right = '1rem';
        messagesContainer.style.width = '300px';
        messagesContainer.style.backgroundColor = 'var(--color-white)';
        messagesContainer.style.borderRadius = 'var(--card-border-radius)';
        messagesContainer.style.boxShadow = '0 0 1rem var(--color-primary)';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.overflow = 'hidden';
        
        const header = document.createElement('div');
        header.className = 'messages-header';
        header.style.padding = '1rem';
        header.style.borderBottom = '1px solid var(--color-light)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h3>Messages</h3>
            <span class="close-messages"><i class="uil uil-times"></i></span>
        `;
        
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        messagesList.style.maxHeight = '300px';
        messagesList.style.overflowY = 'auto';
        messagesList.style.padding = '1rem';
        
        messagesContainer.appendChild(header);
        messagesContainer.appendChild(messagesList);
        document.body.appendChild(messagesContainer);
        
        // Add event listener to close button
        header.querySelector('.close-messages').addEventListener('click', () => {
            messagesContainer.style.display = 'none';
        });
    } else {
        messagesContainer.style.display = 'block';
    }
    
    const messagesList = messagesContainer.querySelector('.messages-list');
    messagesList.innerHTML = '';
    
    if (data.length === 0) {
        messagesList.innerHTML = '<p class="text-muted">No messages found</p>';
    } else {
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.style.display = 'flex';
            messageElement.style.gap = '1rem';
            messageElement.style.marginBottom = '1rem';
            messageElement.style.padding = '0.5rem';
            messageElement.style.borderBottom = '1px solid var(--color-light)';
            
            messageElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${message.author.avatar || '../static/images/male.png'}" alt="${message.author.name}">
                </div>
                <div class="message-content">
                    <h4>${message.author.name}</h4>
                    <p>${message.content}</p>
                    <small class="text-muted">${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
            
            messagesList.appendChild(messageElement);
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}// InstaConnect JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initPosts();
    initMessages();
    initThemeCustomization();
});

function initNavigation() {
    // Handle navigation menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchUsersAndProjects(query);
            }
        }, 500));
    }

    // Handle notifications popup
    const notificationsMenu = document.querySelector('#notifications');
    if (notificationsMenu) {
        notificationsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.notifications-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Handle messages notifications
    const messagesMenu = document.querySelector('#messages-notifications');
    if (messagesMenu) {
        messagesMenu.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle messages visibility or navigate to messages page
            // This would be implemented based on your app's design
            console.log('Messages clicked');
        });
    }
}

function initPosts() {
    // Handle post creation
    const postForms = document.querySelectorAll('.create-post');
    postForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = this.querySelector('input[type="text"]').value.trim();
            if (content) {
                createPost(content);
                this.reset();
            }
        });
    });

    // Handle post interactions (like, comment, share, bookmark)
    document.querySelectorAll('.feeds').forEach(feed => {
        feed.addEventListener('click', function(e) {
            // Handle both span[data-action] and button.interaction-btn
            const target = e.target.closest('[data-action], .interaction-btn, .bookmark span');
            if (!target) return;
            
            const action = target.getAttribute('data-action') || '';
            const icon = target.querySelector('i');
            
            if (icon.classList.contains('uil-heart') || action === 'like') {
                icon.classList.toggle('liked');
                target.setAttribute('aria-pressed', icon.classList.contains('liked'));
                if (icon.classList.contains('liked')) {
                    icon.style.color = 'var(--color-danger)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-comment-dots') || action === 'comment') {
                const feedItem = target.closest('.feed');
                const commentSection = feedItem.querySelector('.comments-section') || createCommentSection(feedItem);
                const isVisible = commentSection.style.display !== 'none';
                commentSection.style.display = isVisible ? 'none' : 'block';
                target.setAttribute('aria-expanded', !isVisible);
            } else if (icon.classList.contains('uil-bookmark-full')) {
                icon.classList.toggle('bookmarked');
                target.setAttribute('aria-pressed', icon.classList.contains('bookmarked'));
                if (icon.classList.contains('bookmarked')) {
                    icon.style.color = 'var(--color-primary)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-share-alt') || action === 'share') {
                // Implement share functionality
                console.log('Share post');
                // You could open a share modal or implement native sharing
                alert('Sharing this post!');
            }
        });

        // Add keyboard support for interaction buttons
        feed.querySelectorAll('.interaction-btn, [data-action], .bookmark span').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    });

    // Make edit buttons functional
    document.querySelectorAll('.edit').forEach(editButton => {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

function createCommentSection(feedItem) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input">
            <input type="text" placeholder="Add a comment...">
            <button>Post</button>
        </div>
        <div class="comments-list"></div>
    `;

    const commentInput = commentSection.querySelector('input');
    const commentButton = commentSection.querySelector('button');

    commentButton.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            addComment(commentSection, comment);
            commentInput.value = '';
        }
    });

    feedItem.appendChild(commentSection);
    return commentSection;
}

function addComment(commentSection, comment) {
    const commentsList = commentSection.querySelector('.comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <p><b>User</b> ${comment}</p>
        <small class="text-muted">Just now</small>
    `;
    commentsList.appendChild(commentElement);
}

function initThemeCustomization() {
    const themeButton = document.querySelector('#theme');
    const themeModal = document.querySelector('.customize-theme');
    const fontSizes = document.querySelectorAll('.choose-size span');
    const colorPalette = document.querySelectorAll('.choose-color span');
    const bgColors = document.querySelectorAll('.choose-bg div');
    const root = document.querySelector(':root');
    
    // Open modal
    themeButton.addEventListener('click', function() {
        themeModal.style.display = 'grid';
    });

    // Close modal when clicking outside the card
    themeModal.addEventListener('click', function(e) {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    // Font sizes
    fontSizes.forEach(size => {
        size.addEventListener('click', () => {
            fontSizes.forEach(s => s.classList.remove('active'));
            size.classList.add('active');
            let fontSize;
            if (size.classList.contains('font-size-1')) fontSize = '10px';
            if (size.classList.contains('font-size-2')) fontSize = '13px';
            if (size.classList.contains('font-size-3')) fontSize = '16px';
            if (size.classList.contains('font-size-4')) fontSize = '19px';
            if (size.classList.contains('font-size-5')) fontSize = '22px';
            document.querySelector('html').style.fontSize = fontSize;
            
            // Save to localStorage
            localStorage.setItem('fontSize', fontSize);
        });
    });

    // Colors
    colorPalette.forEach(color => {
        color.addEventListener('click', () => {
            colorPalette.forEach(c => c.classList.remove('active'));
            color.classList.add('active');
            let primaryHue;
            if (color.classList.contains('color-1')) primaryHue = 252;
            if (color.classList.contains('color-2')) primaryHue = 52;
            if (color.classList.contains('color-3')) primaryHue = 352;
            if (color.classList.contains('color-4')) primaryHue = 152;
            if (color.classList.contains('color-5')) primaryHue = 202;
            root.style.setProperty('--primary-color-hue', primaryHue);
            
            // Save to localStorage
            localStorage.setItem('primaryHue', primaryHue);
        });
    });
    
    // Background colors
    if (bgColors && bgColors.length > 0) {
        bgColors.forEach(bg => {
            bg.addEventListener('click', () => {
                bgColors.forEach(b => b.classList.remove('active'));
                bg.classList.add('active');
                let darkColorLightness;
                let lightColorLightness;
                let whiteColorLightness;
                
                if (bg.classList.contains('bg-1')) {
                    // Light theme
                    darkColorLightness = '17%';
                    lightColorLightness = '95%';
                    whiteColorLightness = '100%';
                } else if (bg.classList.contains('bg-2')) {
                    // Dim theme
                    darkColorLightness = '95%';
                    lightColorLightness = '15%';
                    whiteColorLightness = '20%';
                } else if (bg.classList.contains('bg-3')) {
                    // Dark theme
                    darkColorLightness = '95%';
                    lightColorLightness = '0%';
                    whiteColorLightness = '10%';
                }
                
                root.style.setProperty('--light-color-lightness', lightColorLightness);
                root.style.setProperty('--dark-color-lightness', darkColorLightness);
                root.style.setProperty('--white-color-lightness', whiteColorLightness);
                
                // Save to localStorage
                localStorage.setItem('darkColorLightness', darkColorLightness);
                localStorage.setItem('lightColorLightness', lightColorLightness);
                localStorage.setItem('whiteColorLightness', whiteColorLightness);
            });
        });
    }
    
    // Load saved settings from localStorage
    function loadSavedSettings() {
        const savedFontSize = localStorage.getItem('fontSize');
        const savedPrimaryHue = localStorage.getItem('primaryHue');
        const savedDarkColorLightness = localStorage.getItem('darkColorLightness');
        const savedLightColorLightness = localStorage.getItem('lightColorLightness');
        const savedWhiteColorLightness = localStorage.getItem('whiteColorLightness');
        
        if (savedFontSize) {
            document.querySelector('html').style.fontSize = savedFontSize;
            fontSizes.forEach(size => {
                size.classList.remove('active');
                if (size.classList.contains(`font-size-${getFontSizeIndex(savedFontSize)}`)) {
                    size.classList.add('active');
                }
            });
        }
        
        if (savedPrimaryHue) {
            root.style.setProperty('--primary-color-hue', savedPrimaryHue);
            colorPalette.forEach(color => {
                color.classList.remove('active');
                if (getColorIndex(savedPrimaryHue) > 0 && 
                    color.classList.contains(`color-${getColorIndex(savedPrimaryHue)}`)) {
                    color.classList.add('active');
                }
            });
        }
        
        if (savedDarkColorLightness && savedLightColorLightness && savedWhiteColorLightness) {
            root.style.setProperty('--dark-color-lightness', savedDarkColorLightness);
            root.style.setProperty('--light-color-lightness', savedLightColorLightness);
            root.style.setProperty('--white-color-lightness', savedWhiteColorLightness);
            
            if (bgColors && bgColors.length > 0) {
                bgColors.forEach(bg => {
                    bg.classList.remove('active');
                    if (getBgIndex(savedLightColorLightness) > 0 && 
                        bg.classList.contains(`bg-${getBgIndex(savedLightColorLightness)}`)) {
                        bg.classList.add('active');
                    }
                });
            }
        }
    }
    
    function getFontSizeIndex(fontSize) {
        switch(fontSize) {
            case '10px': return 1;
            case '13px': return 2;
            case '16px': return 3;
            case '19px': return 4;
            case '22px': return 5;
            default: return 3;
        }
    }
    
    function getColorIndex(hue) {
        switch(parseInt(hue)) {
            case 252: return 1;
            case 52: return 2;
            case 352: return 3;
            case 152: return 4;
            case 202: return 5;
            default: return 1;
        }
    }
    
    function getBgIndex(lightColorLightness) {
        switch(lightColorLightness) {
            case '95%': return 1; // Light theme
            case '15%': return 2; // Dim theme
            case '0%': return 3;  // Dark theme
            default: return 1;
        }
    }
    
    // Load saved settings when page loads
    loadSavedSettings();
}

function initMessages() {
    // Handle message search
    const messageSearch = document.querySelector('#message-search');
    messageSearch.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim();
        if (query.length > 2) {
            searchMessages(query);
        }
    }, 500));
}

// This function is now merged with the main initThemeCustomization function above

// API Functions
async function searchUsersAndProjects(query) {
    try {
        // For demo purposes, we'll create mock search results
        console.log('Searching for:', query);
        const mockResults = [
            { name: 'John Doe', avatar: '../static/images/male.png', description: 'Computer Science Student' },
            { name: 'Jane Smith', avatar: '../static/images/female.png', description: 'Data Science Researcher' },
            { name: 'AI Project', avatar: null, description: 'Machine Learning Project' }
        ];
        
        // Filter results based on query
        const filteredResults = mockResults.filter(result => 
            result.name.toLowerCase().includes(query.toLowerCase()) || 
            (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        updateSearchResults({ results: filteredResults });
    } catch (error) {
        console.error('Search error:', error);
    }
}

async function createPost(content) {
    try {
        // For demo purposes, we'll create a mock post
        console.log('Creating post with content:', content);
        const mockPost = {
            id: Date.now(),
            content: content,
            author: {
                name: 'Current User',
                avatar: '../static/images/male.png'
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        addPostToFeed(mockPost);
        return { success: true, post: mockPost };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, error: error.message };
    }
}

async function searchMessages(query) {
    try {
        // For demo purposes, we'll create mock message results
        console.log('Searching messages for:', query);
        const mockMessages = [
            { 
                id: 1, 
                content: 'Hello there!', 
                author: { name: 'John Doe', avatar: '../static/images/male.png' },
                timestamp: '2023-05-15T10:30:00Z'
            },
            { 
                id: 2, 
                content: 'How are you doing?', 
                author: { name: 'Jane Smith', avatar: '../static/images/female.png' },
                timestamp: '2023-05-15T11:45:00Z'
            }
        ];
        
        // Filter messages based on query
        const filteredMessages = mockMessages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );
        
        updateMessages(filteredMessages);
    } catch (error) {
        console.error('Message search error:', error);
    }
}

// UI Update Functions
function addPostToFeed(post) {
    const feed = document.querySelector('.feeds');
    const postElement = document.createElement('div');
    postElement.className = 'feed';
    postElement.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${post.author.avatar || '../static/images/male.png'}" alt="${post.author.name}">
                </div>
                <div class="info">
                    <h3>${post.author.name}</h3>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="photo">
            ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span data-action="like"><i class="uil uil-heart"></i></span>
                <span data-action="comment"><i class="uil uil-comment-dots"></i></span>
                <span data-action="share"><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <p>Be the first to like this</p>
        </div>
        <div class="comments text-muted">
            No comments yet
        </div>
    `;
    
    // Add the new post at the beginning of the feed
    feed.insertBefore(postElement, feed.firstChild);
    
    // Add event listeners to the new post's buttons
    const editButton = postElement.querySelector('.edit');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    return postElement;
}

function updateSearchResults(data) {
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.position = 'absolute';
    searchResults.style.top = '100%';
    searchResults.style.left = '0';
    searchResults.style.width = '100%';
    searchResults.style.backgroundColor = 'var(--color-white)';
    searchResults.style.borderRadius = 'var(--card-border-radius)';
    searchResults.style.boxShadow = '0 0 1rem var(--color-primary)';
    searchResults.style.zIndex = '10';
    searchResults.style.padding = '1rem';
    
    // Remove any existing search results
    document.querySelectorAll('.search-results').forEach(el => el.remove());
    
    if (data.results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
    } else {
        data.results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.style.display = 'flex';
            resultElement.style.alignItems = 'center';
            resultElement.style.gap = '1rem';
            resultElement.style.padding = '0.5rem';
            resultElement.style.borderBottom = '1px solid var(--color-light)';
            resultElement.style.cursor = 'pointer';
            
            resultElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${result.avatar || '../static/images/male.png'}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <h4>${result.name}</h4>
                    <p class="text-muted">${result.description || ''}</p>
                </div>
            `;
            
            resultElement.addEventListener('click', () => {
                console.log('Selected result:', result);
                searchResults.remove();
            });
            
            searchResults.appendChild(resultElement);
        });
    }
    
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.position = 'relative';
    searchBar.appendChild(searchResults);
}

function updateMessages(data) {
    // Create a messages container if it doesn't exist
    let messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '1rem';
        messagesContainer.style.right = '1rem';
        messagesContainer.style.width = '300px';
        messagesContainer.style.backgroundColor = 'var(--color-white)';
        messagesContainer.style.borderRadius = 'var(--card-border-radius)';
        messagesContainer.style.boxShadow = '0 0 1rem var(--color-primary)';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.overflow = 'hidden';
        
        const header = document.createElement('div');
        header.className = 'messages-header';
        header.style.padding = '1rem';
        header.style.borderBottom = '1px solid var(--color-light)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h3>Messages</h3>
            <span class="close-messages"><i class="uil uil-times"></i></span>
        `;
        
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        messagesList.style.maxHeight = '300px';
        messagesList.style.overflowY = 'auto';
        messagesList.style.padding = '1rem';
        
        messagesContainer.appendChild(header);
        messagesContainer.appendChild(messagesList);
        document.body.appendChild(messagesContainer);
        
        // Add event listener to close button
        header.querySelector('.close-messages').addEventListener('click', () => {
            messagesContainer.style.display = 'none';
        });
    } else {
        messagesContainer.style.display = 'block';
    }
    
    const messagesList = messagesContainer.querySelector('.messages-list');
    messagesList.innerHTML = '';
    
    if (data.length === 0) {
        messagesList.innerHTML = '<p class="text-muted">No messages found</p>';
    } else {
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.style.display = 'flex';
            messageElement.style.gap = '1rem';
            messageElement.style.marginBottom = '1rem';
            messageElement.style.padding = '0.5rem';
            messageElement.style.borderBottom = '1px solid var(--color-light)';
            
            messageElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${message.author.avatar || '../static/images/male.png'}" alt="${message.author.name}">
                </div>
                <div class="message-content">
                    <h4>${message.author.name}</h4>
                    <p>${message.content}</p>
                    <small class="text-muted">${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
            
            messagesList.appendChild(messageElement);
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}// InstaConnect JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initPosts();
    initMessages();
    initThemeCustomization();
});

function initNavigation() {
    // Handle navigation menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchUsersAndProjects(query);
            }
        }, 500));
    }

    // Handle notifications popup
    const notificationsMenu = document.querySelector('#notifications');
    if (notificationsMenu) {
        notificationsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.notifications-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Handle messages notifications
    const messagesMenu = document.querySelector('#messages-notifications');
    if (messagesMenu) {
        messagesMenu.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle messages visibility or navigate to messages page
            // This would be implemented based on your app's design
            console.log('Messages clicked');
        });
    }
}

function initPosts() {
    // Handle post creation
    const postForms = document.querySelectorAll('.create-post');
    postForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = this.querySelector('input[type="text"]').value.trim();
            if (content) {
                createPost(content);
                this.reset();
            }
        });
    });

    // Handle post interactions (like, comment, share, bookmark)
    document.querySelectorAll('.feeds').forEach(feed => {
        feed.addEventListener('click', function(e) {
            // Handle both span[data-action] and button.interaction-btn
            const target = e.target.closest('[data-action], .interaction-btn, .bookmark span');
            if (!target) return;
            
            const action = target.getAttribute('data-action') || '';
            const icon = target.querySelector('i');
            
            if (icon.classList.contains('uil-heart') || action === 'like') {
                icon.classList.toggle('liked');
                target.setAttribute('aria-pressed', icon.classList.contains('liked'));
                if (icon.classList.contains('liked')) {
                    icon.style.color = 'var(--color-danger)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-comment-dots') || action === 'comment') {
                const feedItem = target.closest('.feed');
                const commentSection = feedItem.querySelector('.comments-section') || createCommentSection(feedItem);
                const isVisible = commentSection.style.display !== 'none';
                commentSection.style.display = isVisible ? 'none' : 'block';
                target.setAttribute('aria-expanded', !isVisible);
            } else if (icon.classList.contains('uil-bookmark-full')) {
                icon.classList.toggle('bookmarked');
                target.setAttribute('aria-pressed', icon.classList.contains('bookmarked'));
                if (icon.classList.contains('bookmarked')) {
                    icon.style.color = 'var(--color-primary)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-share-alt') || action === 'share') {
                // Implement share functionality
                console.log('Share post');
                // You could open a share modal or implement native sharing
                alert('Sharing this post!');
            }
        });

        // Add keyboard support for interaction buttons
        feed.querySelectorAll('.interaction-btn, [data-action], .bookmark span').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    });

    // Make edit buttons functional
    document.querySelectorAll('.edit').forEach(editButton => {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

function createCommentSection(feedItem) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input">
            <input type="text" placeholder="Add a comment...">
            <button>Post</button>
        </div>
        <div class="comments-list"></div>
    `;

    const commentInput = commentSection.querySelector('input');
    const commentButton = commentSection.querySelector('button');

    commentButton.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            addComment(commentSection, comment);
            commentInput.value = '';
        }
    });

    feedItem.appendChild(commentSection);
    return commentSection;
}

function addComment(commentSection, comment) {
    const commentsList = commentSection.querySelector('.comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <p><b>User</b> ${comment}</p>
        <small class="text-muted">Just now</small>
    `;
    commentsList.appendChild(commentElement);
}

function initThemeCustomization() {
    const themeButton = document.querySelector('#theme');
    const themeModal = document.querySelector('.customize-theme');
    const fontSizes = document.querySelectorAll('.choose-size span');
    const colorPalette = document.querySelectorAll('.choose-color span');
    const bgColors = document.querySelectorAll('.choose-bg div');
    const root = document.querySelector(':root');
    
    // Open modal
    themeButton.addEventListener('click', function() {
        themeModal.style.display = 'grid';
    });

    // Close modal when clicking outside the card
    themeModal.addEventListener('click', function(e) {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    // Font sizes
    fontSizes.forEach(size => {
        size.addEventListener('click', () => {
            fontSizes.forEach(s => s.classList.remove('active'));
            size.classList.add('active');
            let fontSize;
            if (size.classList.contains('font-size-1')) fontSize = '10px';
            if (size.classList.contains('font-size-2')) fontSize = '13px';
            if (size.classList.contains('font-size-3')) fontSize = '16px';
            if (size.classList.contains('font-size-4')) fontSize = '19px';
            if (size.classList.contains('font-size-5')) fontSize = '22px';
            document.querySelector('html').style.fontSize = fontSize;
            
            // Save to localStorage
            localStorage.setItem('fontSize', fontSize);
        });
    });

    // Colors
    colorPalette.forEach(color => {
        color.addEventListener('click', () => {
            colorPalette.forEach(c => c.classList.remove('active'));
            color.classList.add('active');
            let primaryHue;
            if (color.classList.contains('color-1')) primaryHue = 252;
            if (color.classList.contains('color-2')) primaryHue = 52;
            if (color.classList.contains('color-3')) primaryHue = 352;
            if (color.classList.contains('color-4')) primaryHue = 152;
            if (color.classList.contains('color-5')) primaryHue = 202;
            root.style.setProperty('--primary-color-hue', primaryHue);
            
            // Save to localStorage
            localStorage.setItem('primaryHue', primaryHue);
        });
    });
    
    // Background colors
    if (bgColors && bgColors.length > 0) {
        bgColors.forEach(bg => {
            bg.addEventListener('click', () => {
                bgColors.forEach(b => b.classList.remove('active'));
                bg.classList.add('active');
                let darkColorLightness;
                let lightColorLightness;
                let whiteColorLightness;
                
                if (bg.classList.contains('bg-1')) {
                    // Light theme
                    darkColorLightness = '17%';
                    lightColorLightness = '95%';
                    whiteColorLightness = '100%';
                } else if (bg.classList.contains('bg-2')) {
                    // Dim theme
                    darkColorLightness = '95%';
                    lightColorLightness = '15%';
                    whiteColorLightness = '20%';
                } else if (bg.classList.contains('bg-3')) {
                    // Dark theme
                    darkColorLightness = '95%';
                    lightColorLightness = '0%';
                    whiteColorLightness = '10%';
                }
                
                root.style.setProperty('--light-color-lightness', lightColorLightness);
                root.style.setProperty('--dark-color-lightness', darkColorLightness);
                root.style.setProperty('--white-color-lightness', whiteColorLightness);
                
                // Save to localStorage
                localStorage.setItem('darkColorLightness', darkColorLightness);
                localStorage.setItem('lightColorLightness', lightColorLightness);
                localStorage.setItem('whiteColorLightness', whiteColorLightness);
            });
        });
    }
    
    // Load saved settings from localStorage
    function loadSavedSettings() {
        const savedFontSize = localStorage.getItem('fontSize');
        const savedPrimaryHue = localStorage.getItem('primaryHue');
        const savedDarkColorLightness = localStorage.getItem('darkColorLightness');
        const savedLightColorLightness = localStorage.getItem('lightColorLightness');
        const savedWhiteColorLightness = localStorage.getItem('whiteColorLightness');
        
        if (savedFontSize) {
            document.querySelector('html').style.fontSize = savedFontSize;
            fontSizes.forEach(size => {
                size.classList.remove('active');
                if (size.classList.contains(`font-size-${getFontSizeIndex(savedFontSize)}`)) {
                    size.classList.add('active');
                }
            });
        }
        
        if (savedPrimaryHue) {
            root.style.setProperty('--primary-color-hue', savedPrimaryHue);
            colorPalette.forEach(color => {
                color.classList.remove('active');
                if (getColorIndex(savedPrimaryHue) > 0 && 
                    color.classList.contains(`color-${getColorIndex(savedPrimaryHue)}`)) {
                    color.classList.add('active');
                }
            });
        }
        
        if (savedDarkColorLightness && savedLightColorLightness && savedWhiteColorLightness) {
            root.style.setProperty('--dark-color-lightness', savedDarkColorLightness);
            root.style.setProperty('--light-color-lightness', savedLightColorLightness);
            root.style.setProperty('--white-color-lightness', savedWhiteColorLightness);
            
            if (bgColors && bgColors.length > 0) {
                bgColors.forEach(bg => {
                    bg.classList.remove('active');
                    if (getBgIndex(savedLightColorLightness) > 0 && 
                        bg.classList.contains(`bg-${getBgIndex(savedLightColorLightness)}`)) {
                        bg.classList.add('active');
                    }
                });
            }
        }
    }
    
    function getFontSizeIndex(fontSize) {
        switch(fontSize) {
            case '10px': return 1;
            case '13px': return 2;
            case '16px': return 3;
            case '19px': return 4;
            case '22px': return 5;
            default: return 3;
        }
    }
    
    function getColorIndex(hue) {
        switch(parseInt(hue)) {
            case 252: return 1;
            case 52: return 2;
            case 352: return 3;
            case 152: return 4;
            case 202: return 5;
            default: return 1;
        }
    }
    
    function getBgIndex(lightColorLightness) {
        switch(lightColorLightness) {
            case '95%': return 1; // Light theme
            case '15%': return 2; // Dim theme
            case '0%': return 3;  // Dark theme
            default: return 1;
        }
    }
    
    // Load saved settings when page loads
    loadSavedSettings();
}

function initMessages() {
    // Handle message search
    const messageSearch = document.querySelector('#message-search');
    messageSearch.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim();
        if (query.length > 2) {
            searchMessages(query);
        }
    }, 500));
}

// This function is now merged with the main initThemeCustomization function above

// API Functions
async function searchUsersAndProjects(query) {
    try {
        // For demo purposes, we'll create mock search results
        console.log('Searching for:', query);
        const mockResults = [
            { name: 'John Doe', avatar: '../static/images/male.png', description: 'Computer Science Student' },
            { name: 'Jane Smith', avatar: '../static/images/female.png', description: 'Data Science Researcher' },
            { name: 'AI Project', avatar: null, description: 'Machine Learning Project' }
        ];
        
        // Filter results based on query
        const filteredResults = mockResults.filter(result => 
            result.name.toLowerCase().includes(query.toLowerCase()) || 
            (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        updateSearchResults({ results: filteredResults });
    } catch (error) {
        console.error('Search error:', error);
    }
}

async function createPost(content) {
    try {
        // For demo purposes, we'll create a mock post
        console.log('Creating post with content:', content);
        const mockPost = {
            id: Date.now(),
            content: content,
            author: {
                name: 'Current User',
                avatar: '../static/images/male.png'
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        addPostToFeed(mockPost);
        return { success: true, post: mockPost };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, error: error.message };
    }
}

async function searchMessages(query) {
    try {
        // For demo purposes, we'll create mock message results
        console.log('Searching messages for:', query);
        const mockMessages = [
            { 
                id: 1, 
                content: 'Hello there!', 
                author: { name: 'John Doe', avatar: '../static/images/male.png' },
                timestamp: '2023-05-15T10:30:00Z'
            },
            { 
                id: 2, 
                content: 'How are you doing?', 
                author: { name: 'Jane Smith', avatar: '../static/images/female.png' },
                timestamp: '2023-05-15T11:45:00Z'
            }
        ];
        
        // Filter messages based on query
        const filteredMessages = mockMessages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );
        
        updateMessages(filteredMessages);
    } catch (error) {
        console.error('Message search error:', error);
    }
}

// UI Update Functions
function addPostToFeed(post) {
    const feed = document.querySelector('.feeds');
    const postElement = document.createElement('div');
    postElement.className = 'feed';
    postElement.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${post.author.avatar || '../static/images/male.png'}" alt="${post.author.name}">
                </div>
                <div class="info">
                    <h3>${post.author.name}</h3>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="photo">
            ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span data-action="like"><i class="uil uil-heart"></i></span>
                <span data-action="comment"><i class="uil uil-comment-dots"></i></span>
                <span data-action="share"><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <p>Be the first to like this</p>
        </div>
        <div class="comments text-muted">
            No comments yet
        </div>
    `;
    
    // Add the new post at the beginning of the feed
    feed.insertBefore(postElement, feed.firstChild);
    
    // Add event listeners to the new post's buttons
    const editButton = postElement.querySelector('.edit');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    return postElement;
}

function updateSearchResults(data) {
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.position = 'absolute';
    searchResults.style.top = '100%';
    searchResults.style.left = '0';
    searchResults.style.width = '100%';
    searchResults.style.backgroundColor = 'var(--color-white)';
    searchResults.style.borderRadius = 'var(--card-border-radius)';
    searchResults.style.boxShadow = '0 0 1rem var(--color-primary)';
    searchResults.style.zIndex = '10';
    searchResults.style.padding = '1rem';
    
    // Remove any existing search results
    document.querySelectorAll('.search-results').forEach(el => el.remove());
    
    if (data.results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
    } else {
        data.results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.style.display = 'flex';
            resultElement.style.alignItems = 'center';
            resultElement.style.gap = '1rem';
            resultElement.style.padding = '0.5rem';
            resultElement.style.borderBottom = '1px solid var(--color-light)';
            resultElement.style.cursor = 'pointer';
            
            resultElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${result.avatar || '../static/images/male.png'}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <h4>${result.name}</h4>
                    <p class="text-muted">${result.description || ''}</p>
                </div>
            `;
            
            resultElement.addEventListener('click', () => {
                console.log('Selected result:', result);
                searchResults.remove();
            });
            
            searchResults.appendChild(resultElement);
        });
    }
    
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.position = 'relative';
    searchBar.appendChild(searchResults);
}

function updateMessages(data) {
    // Create a messages container if it doesn't exist
    let messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '1rem';
        messagesContainer.style.right = '1rem';
        messagesContainer.style.width = '300px';
        messagesContainer.style.backgroundColor = 'var(--color-white)';
        messagesContainer.style.borderRadius = 'var(--card-border-radius)';
        messagesContainer.style.boxShadow = '0 0 1rem var(--color-primary)';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.overflow = 'hidden';
        
        const header = document.createElement('div');
        header.className = 'messages-header';
        header.style.padding = '1rem';
        header.style.borderBottom = '1px solid var(--color-light)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h3>Messages</h3>
            <span class="close-messages"><i class="uil uil-times"></i></span>
        `;
        
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        messagesList.style.maxHeight = '300px';
        messagesList.style.overflowY = 'auto';
        messagesList.style.padding = '1rem';
        
        messagesContainer.appendChild(header);
        messagesContainer.appendChild(messagesList);
        document.body.appendChild(messagesContainer);
        
        // Add event listener to close button
        header.querySelector('.close-messages').addEventListener('click', () => {
            messagesContainer.style.display = 'none';
        });
    } else {
        messagesContainer.style.display = 'block';
    }
    
    const messagesList = messagesContainer.querySelector('.messages-list');
    messagesList.innerHTML = '';
    
    if (data.length === 0) {
        messagesList.innerHTML = '<p class="text-muted">No messages found</p>';
    } else {
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.style.display = 'flex';
            messageElement.style.gap = '1rem';
            messageElement.style.marginBottom = '1rem';
            messageElement.style.padding = '0.5rem';
            messageElement.style.borderBottom = '1px solid var(--color-light)';
            
            messageElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${message.author.avatar || '../static/images/male.png'}" alt="${message.author.name}">
                </div>
                <div class="message-content">
                    <h4>${message.author.name}</h4>
                    <p>${message.content}</p>
                    <small class="text-muted">${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
            
            messagesList.appendChild(messageElement);
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}// InstaConnect JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initPosts();
    initMessages();
    initThemeCustomization();
});

function initNavigation() {
    // Handle navigation menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchUsersAndProjects(query);
            }
        }, 500));
    }

    // Handle notifications popup
    const notificationsMenu = document.querySelector('#notifications');
    if (notificationsMenu) {
        notificationsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.notifications-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Handle messages notifications
    const messagesMenu = document.querySelector('#messages-notifications');
    if (messagesMenu) {
        messagesMenu.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle messages visibility or navigate to messages page
            // This would be implemented based on your app's design
            console.log('Messages clicked');
        });
    }
}

function initPosts() {
    // Handle post creation
    const postForms = document.querySelectorAll('.create-post');
    postForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = this.querySelector('input[type="text"]').value.trim();
            if (content) {
                createPost(content);
                this.reset();
            }
        });
    });

    // Handle post interactions (like, comment, share, bookmark)
    document.querySelectorAll('.feeds').forEach(feed => {
        feed.addEventListener('click', function(e) {
            // Handle both span[data-action] and button.interaction-btn
            const target = e.target.closest('[data-action], .interaction-btn, .bookmark span');
            if (!target) return;
            
            const action = target.getAttribute('data-action') || '';
            const icon = target.querySelector('i');
            
            if (icon.classList.contains('uil-heart') || action === 'like') {
                icon.classList.toggle('liked');
                target.setAttribute('aria-pressed', icon.classList.contains('liked'));
                if (icon.classList.contains('liked')) {
                    icon.style.color = 'var(--color-danger)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-comment-dots') || action === 'comment') {
                const feedItem = target.closest('.feed');
                const commentSection = feedItem.querySelector('.comments-section') || createCommentSection(feedItem);
                const isVisible = commentSection.style.display !== 'none';
                commentSection.style.display = isVisible ? 'none' : 'block';
                target.setAttribute('aria-expanded', !isVisible);
            } else if (icon.classList.contains('uil-bookmark-full')) {
                icon.classList.toggle('bookmarked');
                target.setAttribute('aria-pressed', icon.classList.contains('bookmarked'));
                if (icon.classList.contains('bookmarked')) {
                    icon.style.color = 'var(--color-primary)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-share-alt') || action === 'share') {
                // Implement share functionality
                console.log('Share post');
                // You could open a share modal or implement native sharing
                alert('Sharing this post!');
            }
        });

        // Add keyboard support for interaction buttons
        feed.querySelectorAll('.interaction-btn, [data-action], .bookmark span').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    });

    // Make edit buttons functional
    document.querySelectorAll('.edit').forEach(editButton => {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

function createCommentSection(feedItem) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input">
            <input type="text" placeholder="Add a comment...">
            <button>Post</button>
        </div>
        <div class="comments-list"></div>
    `;

    const commentInput = commentSection.querySelector('input');
    const commentButton = commentSection.querySelector('button');

    commentButton.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            addComment(commentSection, comment);
            commentInput.value = '';
        }
    });

    feedItem.appendChild(commentSection);
    return commentSection;
}

function addComment(commentSection, comment) {
    const commentsList = commentSection.querySelector('.comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <p><b>User</b> ${comment}</p>
        <small class="text-muted">Just now</small>
    `;
    commentsList.appendChild(commentElement);
}

function initThemeCustomization() {
    const themeButton = document.querySelector('#theme');
    const themeModal = document.querySelector('.customize-theme');
    const fontSizes = document.querySelectorAll('.choose-size span');
    const colorPalette = document.querySelectorAll('.choose-color span');
    const bgColors = document.querySelectorAll('.choose-bg div');
    const root = document.querySelector(':root');
    
    // Open modal
    themeButton.addEventListener('click', function() {
        themeModal.style.display = 'grid';
    });

    // Close modal when clicking outside the card
    themeModal.addEventListener('click', function(e) {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    // Font sizes
    fontSizes.forEach(size => {
        size.addEventListener('click', () => {
            fontSizes.forEach(s => s.classList.remove('active'));
            size.classList.add('active');
            let fontSize;
            if (size.classList.contains('font-size-1')) fontSize = '10px';
            if (size.classList.contains('font-size-2')) fontSize = '13px';
            if (size.classList.contains('font-size-3')) fontSize = '16px';
            if (size.classList.contains('font-size-4')) fontSize = '19px';
            if (size.classList.contains('font-size-5')) fontSize = '22px';
            document.querySelector('html').style.fontSize = fontSize;
            
            // Save to localStorage
            localStorage.setItem('fontSize', fontSize);
        });
    });

    // Colors
    colorPalette.forEach(color => {
        color.addEventListener('click', () => {
            colorPalette.forEach(c => c.classList.remove('active'));
            color.classList.add('active');
            let primaryHue;
            if (color.classList.contains('color-1')) primaryHue = 252;
            if (color.classList.contains('color-2')) primaryHue = 52;
            if (color.classList.contains('color-3')) primaryHue = 352;
            if (color.classList.contains('color-4')) primaryHue = 152;
            if (color.classList.contains('color-5')) primaryHue = 202;
            root.style.setProperty('--primary-color-hue', primaryHue);
            
            // Save to localStorage
            localStorage.setItem('primaryHue', primaryHue);
        });
    });
    
    // Background colors
    if (bgColors && bgColors.length > 0) {
        bgColors.forEach(bg => {
            bg.addEventListener('click', () => {
                bgColors.forEach(b => b.classList.remove('active'));
                bg.classList.add('active');
                let darkColorLightness;
                let lightColorLightness;
                let whiteColorLightness;
                
                if (bg.classList.contains('bg-1')) {
                    // Light theme
                    darkColorLightness = '17%';
                    lightColorLightness = '95%';
                    whiteColorLightness = '100%';
                } else if (bg.classList.contains('bg-2')) {
                    // Dim theme
                    darkColorLightness = '95%';
                    lightColorLightness = '15%';
                    whiteColorLightness = '20%';
                } else if (bg.classList.contains('bg-3')) {
                    // Dark theme
                    darkColorLightness = '95%';
                    lightColorLightness = '0%';
                    whiteColorLightness = '10%';
                }
                
                root.style.setProperty('--light-color-lightness', lightColorLightness);
                root.style.setProperty('--dark-color-lightness', darkColorLightness);
                root.style.setProperty('--white-color-lightness', whiteColorLightness);
                
                // Save to localStorage
                localStorage.setItem('darkColorLightness', darkColorLightness);
                localStorage.setItem('lightColorLightness', lightColorLightness);
                localStorage.setItem('whiteColorLightness', whiteColorLightness);
            });
        });
    }
    
    // Load saved settings from localStorage
    function loadSavedSettings() {
        const savedFontSize = localStorage.getItem('fontSize');
        const savedPrimaryHue = localStorage.getItem('primaryHue');
        const savedDarkColorLightness = localStorage.getItem('darkColorLightness');
        const savedLightColorLightness = localStorage.getItem('lightColorLightness');
        const savedWhiteColorLightness = localStorage.getItem('whiteColorLightness');
        
        if (savedFontSize) {
            document.querySelector('html').style.fontSize = savedFontSize;
            fontSizes.forEach(size => {
                size.classList.remove('active');
                if (size.classList.contains(`font-size-${getFontSizeIndex(savedFontSize)}`)) {
                    size.classList.add('active');
                }
            });
        }
        
        if (savedPrimaryHue) {
            root.style.setProperty('--primary-color-hue', savedPrimaryHue);
            colorPalette.forEach(color => {
                color.classList.remove('active');
                if (getColorIndex(savedPrimaryHue) > 0 && 
                    color.classList.contains(`color-${getColorIndex(savedPrimaryHue)}`)) {
                    color.classList.add('active');
                }
            });
        }
        
        if (savedDarkColorLightness && savedLightColorLightness && savedWhiteColorLightness) {
            root.style.setProperty('--dark-color-lightness', savedDarkColorLightness);
            root.style.setProperty('--light-color-lightness', savedLightColorLightness);
            root.style.setProperty('--white-color-lightness', savedWhiteColorLightness);
            
            if (bgColors && bgColors.length > 0) {
                bgColors.forEach(bg => {
                    bg.classList.remove('active');
                    if (getBgIndex(savedLightColorLightness) > 0 && 
                        bg.classList.contains(`bg-${getBgIndex(savedLightColorLightness)}`)) {
                        bg.classList.add('active');
                    }
                });
            }
        }
    }
    
    function getFontSizeIndex(fontSize) {
        switch(fontSize) {
            case '10px': return 1;
            case '13px': return 2;
            case '16px': return 3;
            case '19px': return 4;
            case '22px': return 5;
            default: return 3;
        }
    }
    
    function getColorIndex(hue) {
        switch(parseInt(hue)) {
            case 252: return 1;
            case 52: return 2;
            case 352: return 3;
            case 152: return 4;
            case 202: return 5;
            default: return 1;
        }
    }
    
    function getBgIndex(lightColorLightness) {
        switch(lightColorLightness) {
            case '95%': return 1; // Light theme
            case '15%': return 2; // Dim theme
            case '0%': return 3;  // Dark theme
            default: return 1;
        }
    }
    
    // Load saved settings when page loads
    loadSavedSettings();
}

function initMessages() {
    // Handle message search
    const messageSearch = document.querySelector('#message-search');
    messageSearch.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim();
        if (query.length > 2) {
            searchMessages(query);
        }
    }, 500));
}

// This function is now merged with the main initThemeCustomization function above

// API Functions
async function searchUsersAndProjects(query) {
    try {
        // For demo purposes, we'll create mock search results
        console.log('Searching for:', query);
        const mockResults = [
            { name: 'John Doe', avatar: '../static/images/male.png', description: 'Computer Science Student' },
            { name: 'Jane Smith', avatar: '../static/images/female.png', description: 'Data Science Researcher' },
            { name: 'AI Project', avatar: null, description: 'Machine Learning Project' }
        ];
        
        // Filter results based on query
        const filteredResults = mockResults.filter(result => 
            result.name.toLowerCase().includes(query.toLowerCase()) || 
            (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        updateSearchResults({ results: filteredResults });
    } catch (error) {
        console.error('Search error:', error);
    }
}

async function createPost(content) {
    try {
        // For demo purposes, we'll create a mock post
        console.log('Creating post with content:', content);
        const mockPost = {
            id: Date.now(),
            content: content,
            author: {
                name: 'Current User',
                avatar: '../static/images/male.png'
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        addPostToFeed(mockPost);
        return { success: true, post: mockPost };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, error: error.message };
    }
}

async function searchMessages(query) {
    try {
        // For demo purposes, we'll create mock message results
        console.log('Searching messages for:', query);
        const mockMessages = [
            { 
                id: 1, 
                content: 'Hello there!', 
                author: { name: 'John Doe', avatar: '../static/images/male.png' },
                timestamp: '2023-05-15T10:30:00Z'
            },
            { 
                id: 2, 
                content: 'How are you doing?', 
                author: { name: 'Jane Smith', avatar: '../static/images/female.png' },
                timestamp: '2023-05-15T11:45:00Z'
            }
        ];
        
        // Filter messages based on query
        const filteredMessages = mockMessages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );
        
        updateMessages(filteredMessages);
    } catch (error) {
        console.error('Message search error:', error);
    }
}

// UI Update Functions
function addPostToFeed(post) {
    const feed = document.querySelector('.feeds');
    const postElement = document.createElement('div');
    postElement.className = 'feed';
    postElement.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${post.author.avatar || '../static/images/male.png'}" alt="${post.author.name}">
                </div>
                <div class="info">
                    <h3>${post.author.name}</h3>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="photo">
            ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span data-action="like"><i class="uil uil-heart"></i></span>
                <span data-action="comment"><i class="uil uil-comment-dots"></i></span>
                <span data-action="share"><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <p>Be the first to like this</p>
        </div>
        <div class="comments text-muted">
            No comments yet
        </div>
    `;
    
    // Add the new post at the beginning of the feed
    feed.insertBefore(postElement, feed.firstChild);
    
    // Add event listeners to the new post's buttons
    const editButton = postElement.querySelector('.edit');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    return postElement;
}

function updateSearchResults(data) {
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.position = 'absolute';
    searchResults.style.top = '100%';
    searchResults.style.left = '0';
    searchResults.style.width = '100%';
    searchResults.style.backgroundColor = 'var(--color-white)';
    searchResults.style.borderRadius = 'var(--card-border-radius)';
    searchResults.style.boxShadow = '0 0 1rem var(--color-primary)';
    searchResults.style.zIndex = '10';
    searchResults.style.padding = '1rem';
    
    // Remove any existing search results
    document.querySelectorAll('.search-results').forEach(el => el.remove());
    
    if (data.results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
    } else {
        data.results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.style.display = 'flex';
            resultElement.style.alignItems = 'center';
            resultElement.style.gap = '1rem';
            resultElement.style.padding = '0.5rem';
            resultElement.style.borderBottom = '1px solid var(--color-light)';
            resultElement.style.cursor = 'pointer';
            
            resultElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${result.avatar || '../static/images/male.png'}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <h4>${result.name}</h4>
                    <p class="text-muted">${result.description || ''}</p>
                </div>
            `;
            
            resultElement.addEventListener('click', () => {
                console.log('Selected result:', result);
                searchResults.remove();
            });
            
            searchResults.appendChild(resultElement);
        });
    }
    
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.position = 'relative';
    searchBar.appendChild(searchResults);
}

function updateMessages(data) {
    // Create a messages container if it doesn't exist
    let messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '1rem';
        messagesContainer.style.right = '1rem';
        messagesContainer.style.width = '300px';
        messagesContainer.style.backgroundColor = 'var(--color-white)';
        messagesContainer.style.borderRadius = 'var(--card-border-radius)';
        messagesContainer.style.boxShadow = '0 0 1rem var(--color-primary)';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.overflow = 'hidden';
        
        const header = document.createElement('div');
        header.className = 'messages-header';
        header.style.padding = '1rem';
        header.style.borderBottom = '1px solid var(--color-light)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h3>Messages</h3>
            <span class="close-messages"><i class="uil uil-times"></i></span>
        `;
        
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        messagesList.style.maxHeight = '300px';
        messagesList.style.overflowY = 'auto';
        messagesList.style.padding = '1rem';
        
        messagesContainer.appendChild(header);
        messagesContainer.appendChild(messagesList);
        document.body.appendChild(messagesContainer);
        
        // Add event listener to close button
        header.querySelector('.close-messages').addEventListener('click', () => {
            messagesContainer.style.display = 'none';
        });
    } else {
        messagesContainer.style.display = 'block';
    }
    
    const messagesList = messagesContainer.querySelector('.messages-list');
    messagesList.innerHTML = '';
    
    if (data.length === 0) {
        messagesList.innerHTML = '<p class="text-muted">No messages found</p>';
    } else {
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.style.display = 'flex';
            messageElement.style.gap = '1rem';
            messageElement.style.marginBottom = '1rem';
            messageElement.style.padding = '0.5rem';
            messageElement.style.borderBottom = '1px solid var(--color-light)';
            
            messageElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${message.author.avatar || '../static/images/male.png'}" alt="${message.author.name}">
                </div>
                <div class="message-content">
                    <h4>${message.author.name}</h4>
                    <p>${message.content}</p>
                    <small class="text-muted">${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
            
            messagesList.appendChild(messageElement);
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}// InstaConnect JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initPosts();
    initMessages();
    initThemeCustomization();
});

function initNavigation() {
    // Handle navigation menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchUsersAndProjects(query);
            }
        }, 500));
    }

    // Handle notifications popup
    const notificationsMenu = document.querySelector('#notifications');
    if (notificationsMenu) {
        notificationsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.notifications-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Handle messages notifications
    const messagesMenu = document.querySelector('#messages-notifications');
    if (messagesMenu) {
        messagesMenu.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle messages visibility or navigate to messages page
            // This would be implemented based on your app's design
            console.log('Messages clicked');
        });
    }
}

function initPosts() {
    // Handle post creation
    const postForms = document.querySelectorAll('.create-post');
    postForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = this.querySelector('input[type="text"]').value.trim();
            if (content) {
                createPost(content);
                this.reset();
            }
        });
    });

    // Handle post interactions (like, comment, share, bookmark)
    document.querySelectorAll('.feeds').forEach(feed => {
        feed.addEventListener('click', function(e) {
            // Handle both span[data-action] and button.interaction-btn
            const target = e.target.closest('[data-action], .interaction-btn, .bookmark span');
            if (!target) return;
            
            const action = target.getAttribute('data-action') || '';
            const icon = target.querySelector('i');
            
            if (icon.classList.contains('uil-heart') || action === 'like') {
                icon.classList.toggle('liked');
                target.setAttribute('aria-pressed', icon.classList.contains('liked'));
                if (icon.classList.contains('liked')) {
                    icon.style.color = 'var(--color-danger)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-comment-dots') || action === 'comment') {
                const feedItem = target.closest('.feed');
                const commentSection = feedItem.querySelector('.comments-section') || createCommentSection(feedItem);
                const isVisible = commentSection.style.display !== 'none';
                commentSection.style.display = isVisible ? 'none' : 'block';
                target.setAttribute('aria-expanded', !isVisible);
            } else if (icon.classList.contains('uil-bookmark-full')) {
                icon.classList.toggle('bookmarked');
                target.setAttribute('aria-pressed', icon.classList.contains('bookmarked'));
                if (icon.classList.contains('bookmarked')) {
                    icon.style.color = 'var(--color-primary)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-share-alt') || action === 'share') {
                // Implement share functionality
                console.log('Share post');
                // You could open a share modal or implement native sharing
                alert('Sharing this post!');
            }
        });

        // Add keyboard support for interaction buttons
        feed.querySelectorAll('.interaction-btn, [data-action], .bookmark span').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    });

    // Make edit buttons functional
    document.querySelectorAll('.edit').forEach(editButton => {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

function createCommentSection(feedItem) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input">
            <input type="text" placeholder="Add a comment...">
            <button>Post</button>
        </div>
        <div class="comments-list"></div>
    `;

    const commentInput = commentSection.querySelector('input');
    const commentButton = commentSection.querySelector('button');

    commentButton.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            addComment(commentSection, comment);
            commentInput.value = '';
        }
    });

    feedItem.appendChild(commentSection);
    return commentSection;
}

function addComment(commentSection, comment) {
    const commentsList = commentSection.querySelector('.comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <p><b>User</b> ${comment}</p>
        <small class="text-muted">Just now</small>
    `;
    commentsList.appendChild(commentElement);
}

function initThemeCustomization() {
    const themeButton = document.querySelector('#theme');
    const themeModal = document.querySelector('.customize-theme');
    const fontSizes = document.querySelectorAll('.choose-size span');
    const colorPalette = document.querySelectorAll('.choose-color span');
    const bgColors = document.querySelectorAll('.choose-bg div');
    const root = document.querySelector(':root');
    
    // Open modal
    themeButton.addEventListener('click', function() {
        themeModal.style.display = 'grid';
    });

    // Close modal when clicking outside the card
    themeModal.addEventListener('click', function(e) {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    // Font sizes
    fontSizes.forEach(size => {
        size.addEventListener('click', () => {
            fontSizes.forEach(s => s.classList.remove('active'));
            size.classList.add('active');
            let fontSize;
            if (size.classList.contains('font-size-1')) fontSize = '10px';
            if (size.classList.contains('font-size-2')) fontSize = '13px';
            if (size.classList.contains('font-size-3')) fontSize = '16px';
            if (size.classList.contains('font-size-4')) fontSize = '19px';
            if (size.classList.contains('font-size-5')) fontSize = '22px';
            document.querySelector('html').style.fontSize = fontSize;
            
            // Save to localStorage
            localStorage.setItem('fontSize', fontSize);
        });
    });

    // Colors
    colorPalette.forEach(color => {
        color.addEventListener('click', () => {
            colorPalette.forEach(c => c.classList.remove('active'));
            color.classList.add('active');
            let primaryHue;
            if (color.classList.contains('color-1')) primaryHue = 252;
            if (color.classList.contains('color-2')) primaryHue = 52;
            if (color.classList.contains('color-3')) primaryHue = 352;
            if (color.classList.contains('color-4')) primaryHue = 152;
            if (color.classList.contains('color-5')) primaryHue = 202;
            root.style.setProperty('--primary-color-hue', primaryHue);
            
            // Save to localStorage
            localStorage.setItem('primaryHue', primaryHue);
        });
    });
    
    // Background colors
    if (bgColors && bgColors.length > 0) {
        bgColors.forEach(bg => {
            bg.addEventListener('click', () => {
                bgColors.forEach(b => b.classList.remove('active'));
                bg.classList.add('active');
                let darkColorLightness;
                let lightColorLightness;
                let whiteColorLightness;
                
                if (bg.classList.contains('bg-1')) {
                    // Light theme
                    darkColorLightness = '17%';
                    lightColorLightness = '95%';
                    whiteColorLightness = '100%';
                } else if (bg.classList.contains('bg-2')) {
                    // Dim theme
                    darkColorLightness = '95%';
                    lightColorLightness = '15%';
                    whiteColorLightness = '20%';
                } else if (bg.classList.contains('bg-3')) {
                    // Dark theme
                    darkColorLightness = '95%';
                    lightColorLightness = '0%';
                    whiteColorLightness = '10%';
                }
                
                root.style.setProperty('--light-color-lightness', lightColorLightness);
                root.style.setProperty('--dark-color-lightness', darkColorLightness);
                root.style.setProperty('--white-color-lightness', whiteColorLightness);
                
                // Save to localStorage
                localStorage.setItem('darkColorLightness', darkColorLightness);
                localStorage.setItem('lightColorLightness', lightColorLightness);
                localStorage.setItem('whiteColorLightness', whiteColorLightness);
            });
        });
    }
    
    // Load saved settings from localStorage
    function loadSavedSettings() {
        const savedFontSize = localStorage.getItem('fontSize');
        const savedPrimaryHue = localStorage.getItem('primaryHue');
        const savedDarkColorLightness = localStorage.getItem('darkColorLightness');
        const savedLightColorLightness = localStorage.getItem('lightColorLightness');
        const savedWhiteColorLightness = localStorage.getItem('whiteColorLightness');
        
        if (savedFontSize) {
            document.querySelector('html').style.fontSize = savedFontSize;
            fontSizes.forEach(size => {
                size.classList.remove('active');
                if (size.classList.contains(`font-size-${getFontSizeIndex(savedFontSize)}`)) {
                    size.classList.add('active');
                }
            });
        }
        
        if (savedPrimaryHue) {
            root.style.setProperty('--primary-color-hue', savedPrimaryHue);
            colorPalette.forEach(color => {
                color.classList.remove('active');
                if (getColorIndex(savedPrimaryHue) > 0 && 
                    color.classList.contains(`color-${getColorIndex(savedPrimaryHue)}`)) {
                    color.classList.add('active');
                }
            });
        }
        
        if (savedDarkColorLightness && savedLightColorLightness && savedWhiteColorLightness) {
            root.style.setProperty('--dark-color-lightness', savedDarkColorLightness);
            root.style.setProperty('--light-color-lightness', savedLightColorLightness);
            root.style.setProperty('--white-color-lightness', savedWhiteColorLightness);
            
            if (bgColors && bgColors.length > 0) {
                bgColors.forEach(bg => {
                    bg.classList.remove('active');
                    if (getBgIndex(savedLightColorLightness) > 0 && 
                        bg.classList.contains(`bg-${getBgIndex(savedLightColorLightness)}`)) {
                        bg.classList.add('active');
                    }
                });
            }
        }
    }
    
    function getFontSizeIndex(fontSize) {
        switch(fontSize) {
            case '10px': return 1;
            case '13px': return 2;
            case '16px': return 3;
            case '19px': return 4;
            case '22px': return 5;
            default: return 3;
        }
    }
    
    function getColorIndex(hue) {
        switch(parseInt(hue)) {
            case 252: return 1;
            case 52: return 2;
            case 352: return 3;
            case 152: return 4;
            case 202: return 5;
            default: return 1;
        }
    }
    
    function getBgIndex(lightColorLightness) {
        switch(lightColorLightness) {
            case '95%': return 1; // Light theme
            case '15%': return 2; // Dim theme
            case '0%': return 3;  // Dark theme
            default: return 1;
        }
    }
    
    // Load saved settings when page loads
    loadSavedSettings();
}

function initMessages() {
    // Handle message search
    const messageSearch = document.querySelector('#message-search');
    messageSearch.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim();
        if (query.length > 2) {
            searchMessages(query);
        }
    }, 500));
}

// This function is now merged with the main initThemeCustomization function above

// API Functions
async function searchUsersAndProjects(query) {
    try {
        // For demo purposes, we'll create mock search results
        console.log('Searching for:', query);
        const mockResults = [
            { name: 'John Doe', avatar: '../static/images/male.png', description: 'Computer Science Student' },
            { name: 'Jane Smith', avatar: '../static/images/female.png', description: 'Data Science Researcher' },
            { name: 'AI Project', avatar: null, description: 'Machine Learning Project' }
        ];
        
        // Filter results based on query
        const filteredResults = mockResults.filter(result => 
            result.name.toLowerCase().includes(query.toLowerCase()) || 
            (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        updateSearchResults({ results: filteredResults });
    } catch (error) {
        console.error('Search error:', error);
    }
}

async function createPost(content) {
    try {
        // For demo purposes, we'll create a mock post
        console.log('Creating post with content:', content);
        const mockPost = {
            id: Date.now(),
            content: content,
            author: {
                name: 'Current User',
                avatar: '../static/images/male.png'
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        addPostToFeed(mockPost);
        return { success: true, post: mockPost };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, error: error.message };
    }
}

async function searchMessages(query) {
    try {
        // For demo purposes, we'll create mock message results
        console.log('Searching messages for:', query);
        const mockMessages = [
            { 
                id: 1, 
                content: 'Hello there!', 
                author: { name: 'John Doe', avatar: '../static/images/male.png' },
                timestamp: '2023-05-15T10:30:00Z'
            },
            { 
                id: 2, 
                content: 'How are you doing?', 
                author: { name: 'Jane Smith', avatar: '../static/images/female.png' },
                timestamp: '2023-05-15T11:45:00Z'
            }
        ];
        
        // Filter messages based on query
        const filteredMessages = mockMessages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );
        
        updateMessages(filteredMessages);
    } catch (error) {
        console.error('Message search error:', error);
    }
}

// UI Update Functions
function addPostToFeed(post) {
    const feed = document.querySelector('.feeds');
    const postElement = document.createElement('div');
    postElement.className = 'feed';
    postElement.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${post.author.avatar || '../static/images/male.png'}" alt="${post.author.name}">
                </div>
                <div class="info">
                    <h3>${post.author.name}</h3>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="photo">
            ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span data-action="like"><i class="uil uil-heart"></i></span>
                <span data-action="comment"><i class="uil uil-comment-dots"></i></span>
                <span data-action="share"><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <p>Be the first to like this</p>
        </div>
        <div class="comments text-muted">
            No comments yet
        </div>
    `;
    
    // Add the new post at the beginning of the feed
    feed.insertBefore(postElement, feed.firstChild);
    
    // Add event listeners to the new post's buttons
    const editButton = postElement.querySelector('.edit');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    return postElement;
}

function updateSearchResults(data) {
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.position = 'absolute';
    searchResults.style.top = '100%';
    searchResults.style.left = '0';
    searchResults.style.width = '100%';
    searchResults.style.backgroundColor = 'var(--color-white)';
    searchResults.style.borderRadius = 'var(--card-border-radius)';
    searchResults.style.boxShadow = '0 0 1rem var(--color-primary)';
    searchResults.style.zIndex = '10';
    searchResults.style.padding = '1rem';
    
    // Remove any existing search results
    document.querySelectorAll('.search-results').forEach(el => el.remove());
    
    if (data.results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
    } else {
        data.results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.style.display = 'flex';
            resultElement.style.alignItems = 'center';
            resultElement.style.gap = '1rem';
            resultElement.style.padding = '0.5rem';
            resultElement.style.borderBottom = '1px solid var(--color-light)';
            resultElement.style.cursor = 'pointer';
            
            resultElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${result.avatar || '../static/images/male.png'}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <h4>${result.name}</h4>
                    <p class="text-muted">${result.description || ''}</p>
                </div>
            `;
            
            resultElement.addEventListener('click', () => {
                console.log('Selected result:', result);
                searchResults.remove();
            });
            
            searchResults.appendChild(resultElement);
        });
    }
    
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.position = 'relative';
    searchBar.appendChild(searchResults);
}

function updateMessages(data) {
    // Create a messages container if it doesn't exist
    let messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '1rem';
        messagesContainer.style.right = '1rem';
        messagesContainer.style.width = '300px';
        messagesContainer.style.backgroundColor = 'var(--color-white)';
        messagesContainer.style.borderRadius = 'var(--card-border-radius)';
        messagesContainer.style.boxShadow = '0 0 1rem var(--color-primary)';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.overflow = 'hidden';
        
        const header = document.createElement('div');
        header.className = 'messages-header';
        header.style.padding = '1rem';
        header.style.borderBottom = '1px solid var(--color-light)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h3>Messages</h3>
            <span class="close-messages"><i class="uil uil-times"></i></span>
        `;
        
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        messagesList.style.maxHeight = '300px';
        messagesList.style.overflowY = 'auto';
        messagesList.style.padding = '1rem';
        
        messagesContainer.appendChild(header);
        messagesContainer.appendChild(messagesList);
        document.body.appendChild(messagesContainer);
        
        // Add event listener to close button
        header.querySelector('.close-messages').addEventListener('click', () => {
            messagesContainer.style.display = 'none';
        });
    } else {
        messagesContainer.style.display = 'block';
    }
    
    const messagesList = messagesContainer.querySelector('.messages-list');
    messagesList.innerHTML = '';
    
    if (data.length === 0) {
        messagesList.innerHTML = '<p class="text-muted">No messages found</p>';
    } else {
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.style.display = 'flex';
            messageElement.style.gap = '1rem';
            messageElement.style.marginBottom = '1rem';
            messageElement.style.padding = '0.5rem';
            messageElement.style.borderBottom = '1px solid var(--color-light)';
            
            messageElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${message.author.avatar || '../static/images/male.png'}" alt="${message.author.name}">
                </div>
                <div class="message-content">
                    <h4>${message.author.name}</h4>
                    <p>${message.content}</p>
                    <small class="text-muted">${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
            
            messagesList.appendChild(messageElement);
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}// InstaConnect JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initPosts();
    initMessages();
    initThemeCustomization();
});

function initNavigation() {
    // Handle navigation menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchUsersAndProjects(query);
            }
        }, 500));
    }

    // Handle notifications popup
    const notificationsMenu = document.querySelector('#notifications');
    if (notificationsMenu) {
        notificationsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.notifications-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Handle messages notifications
    const messagesMenu = document.querySelector('#messages-notifications');
    if (messagesMenu) {
        messagesMenu.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle messages visibility or navigate to messages page
            // This would be implemented based on your app's design
            console.log('Messages clicked');
        });
    }
}

function initPosts() {
    // Handle post creation
    const postForms = document.querySelectorAll('.create-post');
    postForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = this.querySelector('input[type="text"]').value.trim();
            if (content) {
                createPost(content);
                this.reset();
            }
        });
    });

    // Handle post interactions (like, comment, share, bookmark)
    document.querySelectorAll('.feeds').forEach(feed => {
        feed.addEventListener('click', function(e) {
            // Handle both span[data-action] and button.interaction-btn
            const target = e.target.closest('[data-action], .interaction-btn, .bookmark span');
            if (!target) return;
            
            const action = target.getAttribute('data-action') || '';
            const icon = target.querySelector('i');
            
            if (icon.classList.contains('uil-heart') || action === 'like') {
                icon.classList.toggle('liked');
                target.setAttribute('aria-pressed', icon.classList.contains('liked'));
                if (icon.classList.contains('liked')) {
                    icon.style.color = 'var(--color-danger)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-comment-dots') || action === 'comment') {
                const feedItem = target.closest('.feed');
                const commentSection = feedItem.querySelector('.comments-section') || createCommentSection(feedItem);
                const isVisible = commentSection.style.display !== 'none';
                commentSection.style.display = isVisible ? 'none' : 'block';
                target.setAttribute('aria-expanded', !isVisible);
            } else if (icon.classList.contains('uil-bookmark-full')) {
                icon.classList.toggle('bookmarked');
                target.setAttribute('aria-pressed', icon.classList.contains('bookmarked'));
                if (icon.classList.contains('bookmarked')) {
                    icon.style.color = 'var(--color-primary)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-share-alt') || action === 'share') {
                // Implement share functionality
                console.log('Share post');
                // You could open a share modal or implement native sharing
                alert('Sharing this post!');
            }
        });

        // Add keyboard support for interaction buttons
        feed.querySelectorAll('.interaction-btn, [data-action], .bookmark span').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    });

    // Make edit buttons functional
    document.querySelectorAll('.edit').forEach(editButton => {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

function createCommentSection(feedItem) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input">
            <input type="text" placeholder="Add a comment...">
            <button>Post</button>
        </div>
        <div class="comments-list"></div>
    `;

    const commentInput = commentSection.querySelector('input');
    const commentButton = commentSection.querySelector('button');

    commentButton.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            addComment(commentSection, comment);
            commentInput.value = '';
        }
    });

    feedItem.appendChild(commentSection);
    return commentSection;
}

function addComment(commentSection, comment) {
    const commentsList = commentSection.querySelector('.comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <p><b>User</b> ${comment}</p>
        <small class="text-muted">Just now</small>
    `;
    commentsList.appendChild(commentElement);
}

function initThemeCustomization() {
    const themeButton = document.querySelector('#theme');
    const themeModal = document.querySelector('.customize-theme');
    const fontSizes = document.querySelectorAll('.choose-size span');
    const colorPalette = document.querySelectorAll('.choose-color span');
    const bgColors = document.querySelectorAll('.choose-bg div');
    const root = document.querySelector(':root');
    
    // Open modal
    themeButton.addEventListener('click', function() {
        themeModal.style.display = 'grid';
    });

    // Close modal when clicking outside the card
    themeModal.addEventListener('click', function(e) {
        if (e.target === themeModal) {
            themeModal.style.display = 'none';
        }
    });

    // Font sizes
    fontSizes.forEach(size => {
        size.addEventListener('click', () => {
            fontSizes.forEach(s => s.classList.remove('active'));
            size.classList.add('active');
            let fontSize;
            if (size.classList.contains('font-size-1')) fontSize = '10px';
            if (size.classList.contains('font-size-2')) fontSize = '13px';
            if (size.classList.contains('font-size-3')) fontSize = '16px';
            if (size.classList.contains('font-size-4')) fontSize = '19px';
            if (size.classList.contains('font-size-5')) fontSize = '22px';
            document.querySelector('html').style.fontSize = fontSize;
            
            // Save to localStorage
            localStorage.setItem('fontSize', fontSize);
        });
    });

    // Colors
    colorPalette.forEach(color => {
        color.addEventListener('click', () => {
            colorPalette.forEach(c => c.classList.remove('active'));
            color.classList.add('active');
            let primaryHue;
            if (color.classList.contains('color-1')) primaryHue = 252;
            if (color.classList.contains('color-2')) primaryHue = 52;
            if (color.classList.contains('color-3')) primaryHue = 352;
            if (color.classList.contains('color-4')) primaryHue = 152;
            if (color.classList.contains('color-5')) primaryHue = 202;
            root.style.setProperty('--primary-color-hue', primaryHue);
            
            // Save to localStorage
            localStorage.setItem('primaryHue', primaryHue);
        });
    });
    
    // Background colors
    if (bgColors && bgColors.length > 0) {
        bgColors.forEach(bg => {
            bg.addEventListener('click', () => {
                bgColors.forEach(b => b.classList.remove('active'));
                bg.classList.add('active');
                let darkColorLightness;
                let lightColorLightness;
                let whiteColorLightness;
                
                if (bg.classList.contains('bg-1')) {
                    // Light theme
                    darkColorLightness = '17%';
                    lightColorLightness = '95%';
                    whiteColorLightness = '100%';
                } else if (bg.classList.contains('bg-2')) {
                    // Dim theme
                    darkColorLightness = '95%';
                    lightColorLightness = '15%';
                    whiteColorLightness = '20%';
                } else if (bg.classList.contains('bg-3')) {
                    // Dark theme
                    darkColorLightness = '95%';
                    lightColorLightness = '0%';
                    whiteColorLightness = '10%';
                }
                
                root.style.setProperty('--light-color-lightness', lightColorLightness);
                root.style.setProperty('--dark-color-lightness', darkColorLightness);
                root.style.setProperty('--white-color-lightness', whiteColorLightness);
                
                // Save to localStorage
                localStorage.setItem('darkColorLightness', darkColorLightness);
                localStorage.setItem('lightColorLightness', lightColorLightness);
                localStorage.setItem('whiteColorLightness', whiteColorLightness);
            });
        });
    }
    
    // Load saved settings from localStorage
    function loadSavedSettings() {
        const savedFontSize = localStorage.getItem('fontSize');
        const savedPrimaryHue = localStorage.getItem('primaryHue');
        const savedDarkColorLightness = localStorage.getItem('darkColorLightness');
        const savedLightColorLightness = localStorage.getItem('lightColorLightness');
        const savedWhiteColorLightness = localStorage.getItem('whiteColorLightness');
        
        if (savedFontSize) {
            document.querySelector('html').style.fontSize = savedFontSize;
            fontSizes.forEach(size => {
                size.classList.remove('active');
                if (size.classList.contains(`font-size-${getFontSizeIndex(savedFontSize)}`)) {
                    size.classList.add('active');
                }
            });
        }
        
        if (savedPrimaryHue) {
            root.style.setProperty('--primary-color-hue', savedPrimaryHue);
            colorPalette.forEach(color => {
                color.classList.remove('active');
                if (getColorIndex(savedPrimaryHue) > 0 && 
                    color.classList.contains(`color-${getColorIndex(savedPrimaryHue)}`)) {
                    color.classList.add('active');
                }
            });
        }
        
        if (savedDarkColorLightness && savedLightColorLightness && savedWhiteColorLightness) {
            root.style.setProperty('--dark-color-lightness', savedDarkColorLightness);
            root.style.setProperty('--light-color-lightness', savedLightColorLightness);
            root.style.setProperty('--white-color-lightness', savedWhiteColorLightness);
            
            if (bgColors && bgColors.length > 0) {
                bgColors.forEach(bg => {
                    bg.classList.remove('active');
                    if (getBgIndex(savedLightColorLightness) > 0 && 
                        bg.classList.contains(`bg-${getBgIndex(savedLightColorLightness)}`)) {
                        bg.classList.add('active');
                    }
                });
            }
        }
    }
    
    function getFontSizeIndex(fontSize) {
        switch(fontSize) {
            case '10px': return 1;
            case '13px': return 2;
            case '16px': return 3;
            case '19px': return 4;
            case '22px': return 5;
            default: return 3;
        }
    }
    
    function getColorIndex(hue) {
        switch(parseInt(hue)) {
            case 252: return 1;
            case 52: return 2;
            case 352: return 3;
            case 152: return 4;
            case 202: return 5;
            default: return 1;
        }
    }
    
    function getBgIndex(lightColorLightness) {
        switch(lightColorLightness) {
            case '95%': return 1; // Light theme
            case '15%': return 2; // Dim theme
            case '0%': return 3;  // Dark theme
            default: return 1;
        }
    }
    
    // Load saved settings when page loads
    loadSavedSettings();
}

function initMessages() {
    // Handle message search
    const messageSearch = document.querySelector('#message-search');
    messageSearch.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim();
        if (query.length > 2) {
            searchMessages(query);
        }
    }, 500));
}

// This function is now merged with the main initThemeCustomization function above

// API Functions
async function searchUsersAndProjects(query) {
    try {
        // For demo purposes, we'll create mock search results
        console.log('Searching for:', query);
        const mockResults = [
            { name: 'John Doe', avatar: '../static/images/male.png', description: 'Computer Science Student' },
            { name: 'Jane Smith', avatar: '../static/images/female.png', description: 'Data Science Researcher' },
            { name: 'AI Project', avatar: null, description: 'Machine Learning Project' }
        ];
        
        // Filter results based on query
        const filteredResults = mockResults.filter(result => 
            result.name.toLowerCase().includes(query.toLowerCase()) || 
            (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        updateSearchResults({ results: filteredResults });
    } catch (error) {
        console.error('Search error:', error);
    }
}

async function createPost(content) {
    try {
        // For demo purposes, we'll create a mock post
        console.log('Creating post with content:', content);
        const mockPost = {
            id: Date.now(),
            content: content,
            author: {
                name: 'Current User',
                avatar: '../static/images/male.png'
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        addPostToFeed(mockPost);
        return { success: true, post: mockPost };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, error: error.message };
    }
}

async function searchMessages(query) {
    try {
        // For demo purposes, we'll create mock message results
        console.log('Searching messages for:', query);
        const mockMessages = [
            { 
                id: 1, 
                content: 'Hello there!', 
                author: { name: 'John Doe', avatar: '../static/images/male.png' },
                timestamp: '2023-05-15T10:30:00Z'
            },
            { 
                id: 2, 
                content: 'How are you doing?', 
                author: { name: 'Jane Smith', avatar: '../static/images/female.png' },
                timestamp: '2023-05-15T11:45:00Z'
            }
        ];
        
        // Filter messages based on query
        const filteredMessages = mockMessages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );
        
        updateMessages(filteredMessages);
    } catch (error) {
        console.error('Message search error:', error);
    }
}

// UI Update Functions
function addPostToFeed(post) {
    const feed = document.querySelector('.feeds');
    const postElement = document.createElement('div');
    postElement.className = 'feed';
    postElement.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${post.author.avatar || '../static/images/male.png'}" alt="${post.author.name}">
                </div>
                <div class="info">
                    <h3>${post.author.name}</h3>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="photo">
            ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span data-action="like"><i class="uil uil-heart"></i></span>
                <span data-action="comment"><i class="uil uil-comment-dots"></i></span>
                <span data-action="share"><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <p>Be the first to like this</p>
        </div>
        <div class="comments text-muted">
            No comments yet
        </div>
    `;
    
    // Add the new post at the beginning of the feed
    feed.insertBefore(postElement, feed.firstChild);
    
    // Add event listeners to the new post's buttons
    const editButton = postElement.querySelector('.edit');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    return postElement;
}

function updateSearchResults(data) {
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.position = 'absolute';
    searchResults.style.top = '100%';
    searchResults.style.left = '0';
    searchResults.style.width = '100%';
    searchResults.style.backgroundColor = 'var(--color-white)';
    searchResults.style.borderRadius = 'var(--card-border-radius)';
    searchResults.style.boxShadow = '0 0 1rem var(--color-primary)';
    searchResults.style.zIndex = '10';
    searchResults.style.padding = '1rem';
    
    // Remove any existing search results
    document.querySelectorAll('.search-results').forEach(el => el.remove());
    
    if (data.results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
    } else {
        data.results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.style.display = 'flex';
            resultElement.style.alignItems = 'center';
            resultElement.style.gap = '1rem';
            resultElement.style.padding = '0.5rem';
            resultElement.style.borderBottom = '1px solid var(--color-light)';
            resultElement.style.cursor = 'pointer';
            
            resultElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${result.avatar || '../static/images/male.png'}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <h4>${result.name}</h4>
                    <p class="text-muted">${result.description || ''}</p>
                </div>
            `;
            
            resultElement.addEventListener('click', () => {
                console.log('Selected result:', result);
                searchResults.remove();
            });
            
            searchResults.appendChild(resultElement);
        });
    }
    
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.position = 'relative';
    searchBar.appendChild(searchResults);
}

function updateMessages(data) {
    // Create a messages container if it doesn't exist
    let messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '1rem';
        messagesContainer.style.right = '1rem';
        messagesContainer.style.width = '300px';
        messagesContainer.style.backgroundColor = 'var(--color-white)';
        messagesContainer.style.borderRadius = 'var(--card-border-radius)';
        messagesContainer.style.boxShadow = '0 0 1rem var(--color-primary)';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.overflow = 'hidden';
        
        const header = document.createElement('div');
        header.className = 'messages-header';
        header.style.padding = '1rem';
        header.style.borderBottom = '1px solid var(--color-light)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h3>Messages</h3>
            <span class="close-messages"><i class="uil uil-times"></i></span>
        `;
        
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        messagesList.style.maxHeight = '300px';
        messagesList.style.overflowY = 'auto';
        messagesList.style.padding = '1rem';
        
        messagesContainer.appendChild(header);
        messagesContainer.appendChild(messagesList);
        document.body.appendChild(messagesContainer);
        
        // Add event listener to close button
        header.querySelector('.close-messages').addEventListener('click', () => {
            messagesContainer.style.display = 'none';
        });
    } else {
        messagesContainer.style.display = 'block';
    }
    
    const messagesList = messagesContainer.querySelector('.messages-list');
    messagesList.innerHTML = '';
    
    if (data.length === 0) {
        messagesList.innerHTML = '<p class="text-muted">No messages found</p>';
    } else {
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.style.display = 'flex';
            messageElement.style.gap = '1rem';
            messageElement.style.marginBottom = '1rem';
            messageElement.style.padding = '0.5rem';
            messageElement.style.borderBottom = '1px solid var(--color-light)';
            
            messageElement.innerHTML = `
                <div class="profile-photo">
                    <img src="${message.author.avatar || '../static/images/male.png'}" alt="${message.author.name}">
                </div>
                <div class="message-content">
                    <h4>${message.author.name}</h4>
                    <p>${message.content}</p>
                    <small class="text-muted">${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
            
            messagesList.appendChild(messageElement);
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}// InstaConnect JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initPosts();
    initMessages();
    initThemeCustomization();
});

function initNavigation() {
    // Handle navigation menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchUsersAndProjects(query);
            }
        }, 500));
    }

    // Handle notifications popup
    const notificationsMenu = document.querySelector('#notifications');
    if (notificationsMenu) {
        notificationsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.notifications-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Handle messages notifications
    const messagesMenu = document.querySelector('#messages-notifications');
    if (messagesMenu) {
        messagesMenu.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle messages visibility or navigate to messages page
            // This would be implemented based on your app's design
            console.log('Messages clicked');
        });
    }
}

function initPosts() {
    // Handle post creation
    const postForms = document.querySelectorAll('.create-post');
    postForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = this.querySelector('input[type="text"]').value.trim();
            if (content) {
                createPost(content);
                this.reset();
            }
        });
    });

    // Handle post interactions (like, comment, share, bookmark)
    document.querySelectorAll('.feeds').forEach(feed => {
        feed.addEventListener('click', function(e) {
            // Handle both span[data-action] and button.interaction-btn
            const target = e.target.closest('[data-action], .interaction-btn, .bookmark span');
            if (!target) return;
            
            const action = target.getAttribute('data-action') || '';
            const icon = target.querySelector('i');
            
            if (icon.classList.contains('uil-heart') || action === 'like') {
                icon.classList.toggle('liked');
                target.setAttribute('aria-pressed', icon.classList.contains('liked'));
                if (icon.classList.contains('liked')) {
                    icon.style.color = 'var(--color-danger)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-comment-dots') || action === 'comment') {
                const feedItem = target.closest('.feed');
                const commentSection = feedItem.querySelector('.comments-section') || createCommentSection(feedItem);
                const isVisible = commentSection.style.display !== 'none';
                commentSection.style.display = isVisible ? 'none' : 'block';
                target.setAttribute('aria-expanded', !isVisible);
            } else if (icon.classList.contains('uil-bookmark-full')) {
                icon.classList.toggle('bookmarked');
                target.setAttribute('aria-pressed', icon.classList.contains('bookmarked'));
                if (icon.classList.contains('bookmarked')) {
                    icon.style.color = 'var(--color-primary)';
                } else {
                    icon.style.color = '';
                }
            } else if (icon.classList.contains('uil-share-alt') || action === 'share') {
                // Implement share functionality
                console.log('Share post');
                // You could open a share modal or implement native sharing
                alert('Sharing this post!');
            }
        });

        // Add keyboard support for interaction buttons
        feed.querySelectorAll('.interaction-btn, [data-action], .bookmark span').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    });

    // Make edit buttons functional
    document.querySelectorAll('.edit').forEach(editButton => {
        editButton.addEventListener('click', function() {
            // Create and show dropdown menu for edit options
            const dropdown = document.createElement('div');
            dropdown.className = 'edit-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li>Edit Post</li>
                    <li>Delete Post</li>
                    <li>Hide Post</li>
                </ul>
            `;
            
            // Position the dropdown
            this.style.position = 'relative';
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.top = '100%';
            dropdown.style.backgroundColor = 'var(--color-white)';
            dropdown.style.boxShadow = '0 0 1rem var(--color-primary)';
            dropdown.style.borderRadius = 'var(--card-border-radius)';
            dropdown.style.padding = '0.5rem';
            dropdown.style.zIndex = '10';
            
            // Remove any existing dropdowns
            document.querySelectorAll('.edit-dropdown').forEach(d => d.remove());
            
            this.appendChild(dropdown);
            
            // Handle dropdown item clicks
            dropdown.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', function() {
                    console.log('Selected:', this.textContent);
                    dropdown.remove();
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !editButton.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

function createCommentSection(feedItem) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input">
            <input type="text" placeholder="Add a comment...">
            <button>Post</button>
        </div>
        <div class="comments-list"></div>
    `;

    const commentInput = commentSection.querySelector('input');
    const commentButton = commentSection.querySelector('button');

    commentButton.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            addComment(commentSection, comment);
            commentInput.value = '';
        }
    });

    feedItem.appendChild(commentSection);
    return commentSection;
}

function addComment(commentSection, comment) {
}