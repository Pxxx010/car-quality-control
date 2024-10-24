document.getElementById('plantation-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;

    // Coletar fotos dos campos
    const photoInputs = [
        document.getElementById('photo1').files[0],
        document.getElementById('photo2').files[0],
        document.getElementById('photo3').files[0],
        document.getElementById('photo4').files[0],
        document.getElementById('photo5').files[0],
        document.getElementById('photo6').files[0],
    ];

    const photos = [];
    for (const photoInput of photoInputs) {
        if (photoInput) {
            const base64Photo = await convertImageToBase64(photoInput);
            photos.push(base64Photo);
        }
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        try {
            const response = await fetch('http://127.0.0.1:3000/api/plantations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, location, photos }) // Envia um array de fotos
            });

            if (response.ok) {
                document.getElementById('plantation-form').reset();
                fetchPlantations();
            } else {
                console.error('Erro ao adicionar plantação:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
        }
    });
});

async function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function fetchPlantations() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/plantations');
        if (!response.ok) {
            throw new Error('Erro ao buscar plantações');
        }
        const plantations = await response.json();
        console.log(plantations); // Verifique o que está sendo retornado
        if (!Array.isArray(plantations)) {
            throw new Error('A resposta da API não é um array');
        }
        const list = document.getElementById('plantations-list');
        list.innerHTML = '';
        plantations.forEach(p => {
            const item = document.createElement('div');
            item.className = 'plantation-card';
            const mainPhoto = p.photo[0] || 'placeholder.jpg'; // Foto principal ou uma imagem placeholder

            item.innerHTML = `
                <div class="plantation-card">
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <div class="photos">
                        <img class="main-photo" src="${mainPhoto}" alt="${p.name}">
                        <div class="thumbnails">
                            ${p.photo.slice(1).map(photo => `<img class="thumbnail" src="${photo}" alt="${p.name}">`).join('')}
                        </div>
                    </div>
                </div>
            `;

            // Adiciona eventos para abrir o modal ao clicar na imagem principal ou nas miniaturas
            const allImages = item.querySelectorAll('.main-photo, .thumbnail');
            allImages.forEach(img => {
                img.addEventListener('click', () => openModal(img.src));
            });

            list.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar plantações:', error);
    }
}

// Função para abrir o modal
function openModal(imageSrc) {
    $('#modal-image').attr('src', imageSrc);
    $('#download-button').attr('href', imageSrc); // Define o link do botão de download
    $('#imageModal').modal('show');
}


// Fechar o modal quando clicar fora da imagem ou no botão de fechar
function closeModal() {
    $('#imageModal').modal('hide');
}

// Inicializa o carregamento das plantações ao carregar a página
fetchPlantations();
