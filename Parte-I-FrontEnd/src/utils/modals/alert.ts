import { ModalService } from './modal';

export const AlertService = {
  //modal de confirmación con dos botones.
  confirm: (titulo: string, mensaje: string, onConfirm: () => void) => {
    const html = `
      <div class="confirm-modal-content" style="text-align: center; padding: 10px;">
        <h3 style="margin-top: 0; color: #e74c3c;">${titulo}</h3>
        <p style="margin: 15px 0; color: var(--text-muted);">${mensaje}</p>
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
          <button id="btn-confirm-cancel" class="btn" style="background: #ccc; color: #333;">Cancelar</button>
          <button id="btn-confirm-accept" class="btn btn-danger" style="background: #e74c3c; color: white;">Confirmar</button>
        </div>
      </div>
    `;

    ModalService.open(html, () => {
      document.getElementById('btn-confirm-cancel')?.addEventListener('click', () => ModalService.close());
      document.getElementById('btn-confirm-accept')?.addEventListener('click', () => {
        onConfirm();
        ModalService.close();
      });
    });
  },

//Muestra un modal simple de éxito o información.
  
  success: (titulo: string, mensaje: string) => {
    const html = `
      <div class="success-modal-content" style="text-align: center; padding: 10px;">
        <h3 style="margin-top: 0; color: #2ed573;">🎉 ${titulo}</h3>
        <p style="margin: 15px 0; color: var(--text-muted);">${mensaje}</p>
        <button id="btn-success-close" class="btn btn-primary" style="margin-top: 15px; background: #2ed573; border: none;">Aceptar</button>
      </div>
    `;

    ModalService.open(html, () => {
      document.getElementById('btn-success-close')?.addEventListener('click', () => ModalService.close());
    });
  },

  warning: (titulo: string, mensaje: string) => {
    const html = `
      <div class="warning-modal-content" style="text-align: center; padding: 10px;">
        <h3 style="margin-top: 0; color: #dd6b20;">⚠️ ${titulo}</h3>
        <p style="margin: 15px 0; color: var(--text-muted);">${mensaje}</p>
        <button id="btn-warning-close" class="btn" style="margin-top: 15px; background: #dd6b20; border: none; color: white; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">Entendido</button>
      </div>
    `;

    ModalService.open(html, () => {
      document.getElementById('btn-warning-close')?.addEventListener('click', () => ModalService.close());
    });
  }
};