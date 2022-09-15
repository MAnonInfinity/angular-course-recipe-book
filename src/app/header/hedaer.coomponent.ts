import { Component, OnDestroy, OnInit } from "@angular/core"
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";

import { DataStorageService } from "../shared/data-storage.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})

export class HeaderComponent implements OnInit, OnDestroy {
    private userSubscription: Subscription
    isAuthenticated = false

    constructor(private dataStorageService: DataStorageService, private authService: AuthService) {}

    ngOnInit(): void {
        this.userSubscription = this.authService.user.subscribe(user => {
            this.isAuthenticated = !!user  // same as: !user ? false : true
        })
    }

    onSaveData() {
        this.dataStorageService.storeRecipes()
    }

    onFetchData() {
        this.dataStorageService.fetchRecipes().subscribe()
    }

    onLogout() {
        this.authService.logout()
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe()
    }
}