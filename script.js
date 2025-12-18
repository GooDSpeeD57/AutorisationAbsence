document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector('form');
    const signatureContainer = document.querySelector('.signature-container');
    const maDiv = document.getElementById("maDiv");
    const btnEnvoyer = document.getElementById('btnEnvoyer');
    const btnEffacer = document.getElementById('btnEffacer');

    const radios = document.querySelectorAll('input[name="type_date"]');
    const jour = document.getElementById('jour');
    const periode = document.getElementById('periode');

    function updateDateBlocks() {
        const selected = document.querySelector('input[name="type_date"]:checked');
        if (selected) {
            if (selected.value === 'jour') {
                jour.style.display = 'block';
                periode.style.display = 'none';
                form.date_jour.required = true;
                form.date_debut.required = false;
                form.date_fin.required = false;
            } else {
                jour.style.display = 'none';
                periode.style.display = 'block';
                form.date_jour.required = false;
                form.date_debut.required = true;
                form.date_fin.required = true;
            }
        }
    }

    updateDateBlocks();

    radios.forEach(radio => {
        radio.addEventListener('change', updateDateBlocks);
    });

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

    signatureContainer.classList.add('hidden');

    function lockForm(form) {
        form.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
        });
    }

    function keepOnlySelectedCodeBlock() {
        const selected = document.querySelector('input[name="motif_absence"]:checked');
        if (!selected) return;

        const blocks = document.querySelectorAll('.code-block');
        blocks.forEach(block => {
            const inputs = block.querySelectorAll('input[name="motif_absence"]');
            if (!Array.from(inputs).includes(selected)) {
                block.style.display = 'none';
            } else {
                // On cache tous les autres labels sauf celui sélectionné
                inputs.forEach(input => {
                    if (input !== selected) {
                        input.closest('label').style.display = 'none';
                    }
                });
            }
        });

        document.querySelectorAll('#maDiv hr').forEach(hr => {
            hr.style.display = 'none';
        });
    }

    function keepOnlySelectedDateType() {
        const selected = document.querySelector('input[name="type_date"]:checked');

        // cacher labels radio
        radios.forEach(radio => {
            const label = radio.closest('label');
            if (label) label.style.display = 'none';
        });

        document.getElementById('typeDateLabel').style.display = 'none';

        if (selected.value === 'jour') {
            jour.style.display = 'block';
            periode.style.display = 'none';
        } else {
            jour.style.display = 'none';
            periode.style.display = 'block';
        }
    }

    form.addEventListener('submit', e => {
        e.preventDefault();

        const selected = document.querySelector('input[name="motif_absence"]:checked');
        if (!selected) {
            alert("Veuillez sélectionner un motif d'absence");
            return;
        }

        const selectedDateType = document.querySelector('input[name="type_date"]:checked').value;
        if (selectedDateType === 'jour' && !form.date_jour.value) {
            alert("Veuillez sélectionner une date.");
            return;
        }
        if (selectedDateType === 'periode' && (!form.date_debut.value || !form.date_fin.value)) {
            alert("Veuillez sélectionner les dates de début et fin.");
            return;
        }

        lockForm(form);
        keepOnlySelectedCodeBlock();
        keepOnlySelectedDateType();

        btnEnvoyer.classList.add('hidden');
        btnEffacer.classList.add('hidden');

        signatureContainer.classList.remove('hidden');
        btnPrint.classList.remove('hidden');
        btnMail.classList.remove('hidden');
    });
    btnPrint.addEventListener('click', () => {
        window.print();
    });

    const btnMail = document.getElementById('btnMail');

    btnMail.addEventListener('click', () => {

        const motif = document.querySelector('input[name="motif_absence"]:checked');

        let message = `
Autorisation d'absence

Nom : ${form.nom.value}
Prénom : ${form.prenom.value}
Email : ${form.email.value}
Téléphone : ${form.tel.value}
Formation : ${form.formation_suivie.value}
Motif : ${motif ? motif.value : ''}

`;

        if (form.date_jour.value) {
            message += `Date : ${form.date_jour.value}\n`;
        } else {
            message += `Du : ${form.date_debut.value}\nAu : ${form.date_fin.value}\n`;
        }

        const mailto = `mailto:absence@afpa.fr?subject=Autorisation d'absence&body=${encodeURIComponent(message)}`;
        window.location.href = mailto;
    });
});
