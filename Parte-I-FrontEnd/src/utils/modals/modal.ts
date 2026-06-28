export class ModalService {
    private static overlay = document.getElementById('global-modal') as HTMLElement;
    private static contentContainer = document.getElementById('modal-content') as HTMLElement;
    private static closeBtn = document.getElementById('close-modal') as HTMLElement;

    static init() {
        // Escuchar el evento de cierre del botón X o del fondo oscuro
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    }

    /*  Abre el modal e inyecta el HTML correspondiente */
    static open(htmlContent: string | HTMLElement, onRender?: () => void) { // onRender es un callback opcional para enganchar eventos
        if (typeof htmlContent === 'string') {
            this.contentContainer.innerHTML = htmlContent;
        } else {
            this.contentContainer.innerHTML = '';
            this.contentContainer.appendChild(htmlContent);
        }

        this.overlay.classList.add('open');

        if (onRender) onRender();
    }

    static close() {
        this.overlay.classList.remove('open');
        this.contentContainer.innerHTML = '';
    }
}