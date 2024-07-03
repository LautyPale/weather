const input = document.getElementById('cityInput');
const suggestions = document.getElementById('suggestions');
let lastQuery = '';
let lastResults = [];

document.addEventListener('DOMContentLoaded', () => {

    let timeoutId = null;
    // Muestro sugerencias solo cuando el input tiene al menos 3 caracteres
    input.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const query = input.value.trim();
            if (query.length > 2) {
                if (query !== lastQuery) {
                    fetchSuggestions(query);
                } else {
                    displaySuggestions(lastResults);
                }
            } else {
                clearSuggestions();
            }
        }, 500)
    })

    // Verifico si se pulsa la tecla Backspace
    input.addEventListener('keyup', (event) => {

        if (event.key === 'Backspace' && input.value.trim().length <= 2) {
            clearSuggestions();
        }
    })

    input.addEventListener('focus', () => {
        const query = input.value.trim();
        if (query.length > 2 && query === lastQuery && lastResults.length > 0) {
            displaySuggestions(lastResults);
        }
    });

    // Elimino las sugerencias al pulsar fuera del input
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !suggestions.contains(event.target)) {
            clearSuggestions();
        }
    });

});

let index = 0;

function fetchSuggestions(query) {

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=15&language=es&format=json`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results) {
                console.log(data.results);
                lastQuery = query;
                lastResults = data.results;
                displaySuggestions(data.results, index);
            } else {
                clearSuggestions();
            }
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
            errorDiv.textContent = `Error: ${error.message}`;
            errorDiv.classList.remove('hidden');
            clearSuggestions(); 
        });
}

function displaySuggestions(results) {

    clearSuggestions();

    results.forEach( (result, index) => {
        const item = document.createElement('div');
        item.classList.add(
            "suggestion-item",
            "cursor-pointer",
            "hover:bg-black/30",
        );

        const content = document.createElement('div');
        content.classList.add('py-2', 'px-6', 'truncate');

        if (!result.admin1) {
            if (!result.country) {
                content.textContent = `${result.name}`;
            } else {
                content.textContent = `${result.name}, ${result.country}`;
            }
        } else {
            if (result.admin1 === result.country) {
                content.textContent = `${result.name}, ${result.country}`;
            } else {
                content.textContent = `${result.name}, ${result.admin1}, ${result.country}`;
            }
        }

        item.addEventListener('click', () => {
            input.value = result.name;
            params.latitude = result.latitude;
            params.longitude = result.longitude;
            selectedCity.name = result.name;
            selectedCity.country = result.country;

            form.dispatchEvent(new Event('submit'), { bubbles: true, cancelable: true });
            clearSuggestions();
        });

        item.appendChild(content);

        if (index === 0) {
            item.classList.add('rounded-t-3xl');
        }
        if (index === results.length - 1) {
            item.classList.add('rounded-b-3xl');
        }

        suggestions.appendChild(item);

    });

}

function clearSuggestions() {
    suggestions.innerHTML = '';
}