document.addEventListener("DOMContentLoaded", () => {

    const radios = document.querySelectorAll('input[name="type_date"]');
    const jour = document.getElementById('jour');
    const periode = document.getElementById('periode');

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === "jour") {
                jour.style.display = "block";
                periode.style.display = "none";
            } else if (radio.value === "periode") {
                jour.style.display = "none";
                periode.style.display = "block";
            }
        });
    });

    const tel = document.getElementById("telephone");
    tel.addEventListener("input", () => {
        tel.value = tel.value.replace(/[^0-9 ]/g, '');
        const digitsOnly = tel.value.replace(/ /g, '');
        if (!/^[0-9]{10}$/.test(digitsOnly)) {
            tel.setCustomValidity("Veuillez entrer un numéro à 10 chiffres");
        } else {
            tel.setCustomValidity("");
        }
    });

    const maDiv = document.getElementById("maDiv");
    fetch('test.json')
        .then(response => {
            if (!response.ok) throw new Error("Impossible de charger le JSON");
            return response.json();
        })
        .then(data => {
            const motifs = data["Motif de l'absence"];
            let isFirst = true;

            for (const code in motifs) {
                if (!isFirst) {
                    const hr = document.createElement("hr");
                    maDiv.appendChild(hr);
                }
                isFirst = false;

                const item = motifs[code];
                const block = document.createElement("div");
                block.className = "code-block";

                const title = document.createElement("h4");
                title.textContent = code;
                block.appendChild(title);

                if (item.description) {
                    const p = document.createElement("p");
                    p.textContent = item.description;
                    block.appendChild(p);
                }

                if (item.elements) {
                    item.elements.forEach(el => {
                        const label = document.createElement("label");
                        label.style.display = "block";

                        const input = document.createElement("input");
                        input.type = "radio";
                        input.name = "motif_absence";
                        input.value = el;
                        input.dataset.code = code;

                        label.appendChild(input);
                        label.append(" " + el);

                        block.appendChild(label);
                    });
                }

                maDiv.appendChild(block);
            }
        })
        .catch(err => {
            maDiv.textContent = "Erreur : " + err;
        });


    const form = document.querySelector('form');
    const signatureContainer = document.querySelector('.signature-container');
    const btnEnvoyer = document.getElementById('btnEnvoyer');
    const btnEffacer = document.getElementById('btnEffacer');



    signatureContainer.classList.add('hidden');

    form.addEventListener('submit', e => {
        e.preventDefault();

        const selected = document.querySelector('input[name="motif_absence"]:checked');
        if (!selected) {
            alert("Veuillez sélectionner un motif d'absence");
            return;
        }

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        const params = new URLSearchParams(data).toString();
        window.history.replaceState(null, '', '?' + params);

        lockForm(form);

        btnEnvoyer.classList.add('hidden');
        btnEffacer.classList.add('hidden');
        signatureContainer.classList.remove('hidden');
        keepOnlySelectedCodeBlock();
        keepOnlySelectedDateType();

        console.log(data);
    });

    function lockForm(form) {
        const elements = form.querySelectorAll(
            'input, select, textarea, button'
        );

        elements.forEach(el => {
            if (el.type !== 'submit') {
                el.disabled = true;
            }
        });
    }
    function keepOnlySelectedCodeBlock() {
        const blocks = document.querySelectorAll('.code-block');

        blocks.forEach(block => {
            const checked = block.querySelector(
                'input[name="motif_absence"]:checked'
            );

            if (!checked) {
                block.style.display = 'none';
            }
        });

            document.querySelectorAll('#maDiv hr').forEach(hr => {
            hr.style.display = 'none';
        });
    }
    function keepOnlySelectedDateType() {
        const radios = document.querySelectorAll('input[name="type_date"]');

        let selectedType = null;

        radios.forEach(radio => {
            if (radio.checked) {
                selectedType = radio.value;
            }

            const label = radio.closest('label');
            if (label) {
                label.style.display = 'none';
            }
        });

        document.getElementById('typeDateLabel').style.display = 'none';


        if (selectedType === 'jour') {
            document.getElementById('periode').style.display = 'none';
            document.getElementById('jour').style.display = 'block';
        }

        if (selectedType === 'periode') {
            document.getElementById('jour').style.display = 'none';
            document.getElementById('periode').style.display = 'block';
        }
    }

});
