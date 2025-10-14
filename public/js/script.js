//wait for html to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('usernameForm');
    const input = document.getElementById('usernameInput');
    const output = document.getElementById('output');

    form.addEventListener('submit', (e) => {
        //stop page from reloading, used to confirm input is saved in variable properly
        e.preventDefault();

        const username = input.value.trim();
        if (username === ''){
            output.textContent = "Please enter a username";
        } else {
            output.textContent = `You entered ${username}`;
        }
    });
});