import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class CheckTutorial implements CanLoad {

    constructor(private storage: Storage, private router: Router) { }

    public canLoad() {
        return this.storage.get('docker_tutorial').then(res => {
            if (res) {
                this.router.navigate(['/dashboard/home']);
                return false;
            } else {
                return true;
            }
        });
    }

}
