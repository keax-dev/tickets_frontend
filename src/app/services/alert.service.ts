import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private toastr: ToastrService) { }

  success(title: string) {
    this.toastr.success(title, undefined, { positionClass: 'toast-bottom-right' });
  }

  error(result: any) {
    const messageContent = result.messages.map((message: string) => `<li>${message}</li>`).join('');
    this.toastr.error(`<div><strong>${result.alert}</strong><ul>${messageContent}</ul></div>`, undefined, { enableHtml: true, positionClass: 'toast-top-right' });
  }

  errorApplication(spinner: NgxSpinnerService) {
    this.toastr.error('Se produjo un error contacta al administrador', undefined, { positionClass: 'toast-top-right' });
    spinner.hide();
  }

  async questionDelete() {
    const result = await Swal.fire({ title: "Estas seguro de realizar esta acción?", icon: "question", showCancelButton: true, confirmButtonText: "Eliminar", confirmButtonColor: 'rgb(220, 53, 69)', cancelButtonText: "Cancelar", cancelButtonColor: 'rgb(108, 117, 125)', reverseButtons: true })
    return result.isConfirmed;
  }

}
