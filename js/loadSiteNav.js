function loadContent(url, containerElement) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            containerElement.innerHTML = data;
        })
        .catch(error => {
            console.error('Error fetching content:', error);
        });
}

const navTopContainer = document.getElementById('nav-top-container');
const navBottomContainer = document.getElementById('nav-bottom-container');

loadContent('navTop.html', navTopContainer);
loadContent('navBottom.html', navBottomContainer);