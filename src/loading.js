    /* document.addEventListener('DOMContentLoaded', () => {
    const loadingPercentageElement = document.getElementById('loading-percentage');
    const loadingProgressBarElement = document.getElementById('loading-progress-bar');
    const kilobytesLoadedElement = document.getElementById('kilobytes-loaded');
    const loadingScreenElement = document.getElementById('loading-screen');

    const totalKilobytesToLoad = 2048; // Simulate loading 2MB
    let loadedKilobytes = 0;
    const loadIncrement = 50; // Load 50KB at a time
    const intervalTime = 100; // Update every 100ms

    function updateLoader() {
        loadedKilobytes += loadIncrement;
        if (loadedKilobytes > totalKilobytesToLoad) {
            loadedKilobytes = totalKilobytesToLoad;
        }

        const percentage = Math.round((loadedKilobytes / totalKilobytesToLoad) * 100);

        loadingPercentageElement.textContent = `${percentage}%`;
        loadingProgressBarElement.style.width = `${percentage}%`;
        kilobytesLoadedElement.textContent = `${loadedKilobytes} / ${totalKilobytesToLoad} KB`;

        if (loadedKilobytes >= totalKilobytesToLoad) {
            clearInterval(loadingInterval);
            // Optional: Hide loading screen after a short delay
            setTimeout(() => {
                // loadingScreenElement.style.display = 'none';
                console.log('Loading complete!');
            }, 500);
        }
    }

    const loadingInterval = setInterval(updateLoader, intervalTime);
});
 */

//Real Data Loading
 window.addEventListener('load', () => {
  document.getElementById('loading-screen').style.display = 'none';
});