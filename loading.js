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

const pctEl    = document.getElementById('loading-percentage');
const barEl    = document.getElementById('loading-progress-bar');
const kbEl     = document.getElementById('kilobytes-loaded');
const overlay  = document.getElementById('loading-screen');

let fakePct = 0;
const fakeInt = setInterval(() => {
  fakePct = Math.min(100, fakePct + Math.random() * 10|0);
  pctEl.textContent = fakePct + '%';
  barEl.style.width  = fakePct + '%';
  kbEl.textContent   = Math.round((fakePct/100)*2048) + ' / 2048 KB';
  if (fakePct === 100) clearInterval(fakeInt);
}, 100);

// hide when everything’s really done
window.addEventListener('load', () => {
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display='none', 500);
});