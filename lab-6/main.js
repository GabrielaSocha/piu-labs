const api = new Ajax({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
});

const loadBtn = document.getElementById('loadBtn');
const errorBtn = document.getElementById('errorBtn');
const resetBtn = document.getElementById('resetBtn');

const list = document.getElementById('list');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('error');

function showLoader(show) {
    loader.classList.toggle('hidden', !show);
}

function clearView() {
    list.innerHTML = '';
    errorBox.textContent = '';
}

loadBtn.addEventListener('click', async () => {
    clearView();
    showLoader(true);

    try {
        const posts = await api.get('/posts');

        posts.slice(0, 10).forEach((post) => {
            const li = document.createElement('li');
            li.textContent = post.title;
            list.appendChild(li);
        });
    } catch (err) {
        errorBox.textContent = err.message;
    } finally {
        showLoader(false);
    }
});

errorBtn.addEventListener('click', async () => {
    clearView();
    showLoader(true);

    try {
        // wywolanie bledu
        await api.get('/blad-123');
    } catch (err) {
        errorBox.textContent = err.message;
    } finally {
        showLoader(false);
    }
});

resetBtn.addEventListener('click', () => {
    clearView();
});
