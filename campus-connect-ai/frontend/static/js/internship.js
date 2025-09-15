// Internship filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('category');
    const internshipCards = document.querySelectorAll('.internship-card');

    categorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;

        internshipCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
