document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector('form');
    const signatureContainer = document.querySelector('.signature-container');
    const maDiv = document.getElementById("maDiv");
    const btnEnvoyer = document.getElementById('btnEnvoyer');
    const btnEffacer = document.getElementById('btnEffacer');
    const btnPrint = document.getElementById('btnPrint');
    const btnMail = document.getElementById('btnMail');
    const radios = document.querySelectorAll('input[name="type_date"]');
    const jour = document.getElementById('jour');
    const periode = document.getElementById('periode');
    const typeDateLabel = document.getElementById('typeDateLabel');
    const ABSENCE_EMAIL = 'absence@afpa.fr';

    function toggleVisibility(element, show, displayType = "block") {
        element.style.display = show ? displayType : "none";
    }

    function updateDateBlocks() {
        const selected = document.querySelector('input[name="type_date"]:checked');
        if (!selected) return;

        if (selected.value === 'jour') {
            toggleVisibility(jour, true, "block");
            toggleVisibility(periode, false);
            form.date_jour.required = true;
            form.hstart_jour.required = true;
            form.hend_jour.required = true;
            form.date_debut.required = false;
            form.date_fin.required = false;
        } else {
            toggleVisibility(jour, false);
            toggleVisibility(periode, true, "grid");
            form.date_jour.required = false;
            form.hstart_jour.required = false;
            form.hend_jour.required = false;
            form.date_debut.required = true;
            form.date_fin.required = true;
        }
    }

    updateDateBlocks();
    radios.forEach(radio => radio.addEventListener('change', updateDateBlocks));

    fetch('test.json')
        .then(response => {
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
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
            maDiv.textContent = '';
            const errorMsg = document.createElement('p');
            errorMsg.className = 'error';
            errorMsg.textContent = `Erreur : ${err.message}`;
            maDiv.appendChild(errorMsg);
        });

    toggleVisibility(signatureContainer, false);

    function lockForm(form) {
        form.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
    }

    function keepOnlySelectedCodeBlock() {
        const selected = document.querySelector('input[name="motif_absence"]:checked');
        if (!selected) return;

        const blocks = document.querySelectorAll('.code-block');
        blocks.forEach(block => {
            const inputs = block.querySelectorAll('input[name="motif_absence"]');
            if (!Array.from(inputs).includes(selected)) {
                toggleVisibility(block, false);
            } else {
                inputs.forEach(input => {
                    if (input !== selected) toggleVisibility(input.closest('label'), false);
                });
            }
        });

        document.querySelectorAll('#maDiv hr').forEach(hr => toggleVisibility(hr, false));
    }

    function keepOnlySelectedDateType() {
        const selected = document.querySelector('input[name="type_date"]:checked');
        if (!selected) return;

        radios.forEach(radio => toggleVisibility(radio.closest('label'), false));
        toggleVisibility(typeDateLabel, false);
        toggleVisibility(jour, selected.value === 'jour');
        toggleVisibility(periode, selected.value === 'periode');
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
        if (selectedDateType === 'periode') {
            const debut = new Date(form.date_debut.value);
            const fin = new Date(form.date_fin.value);
            if (fin < debut) {
                alert("La date de fin doit être après la date de début");
                return;
            }
        }

        lockForm(form);
        keepOnlySelectedCodeBlock();
        keepOnlySelectedDateType();

        toggleVisibility(btnEnvoyer, false);
        toggleVisibility(btnEffacer, false);
        toggleVisibility(signatureContainer, true);
        toggleVisibility(btnPrint, true);
        toggleVisibility(btnMail, true);
    });

    btnPrint.addEventListener('click', () => window.print());

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
            message += `Heure : ${form.hstart_jour.value} - ${form.hend_jour.value}\n`;
        } else {
            message += `Du : ${form.date_debut.value} Au : ${form.date_fin.value}\n`;
        }

        window.location.href = `mailto:${ABSENCE_EMAIL}?subject=Autorisation d'absence&body=${encodeURIComponent(message)}`;
    });

});
