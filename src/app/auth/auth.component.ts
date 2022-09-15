import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";

import { AuthResponseData, AuthService } from "./auth.service";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})

export class AuthComponent implements OnDestroy {
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective
    private closeSubscription: Subscription

    constructor(
        private authService: AuthService, 
        private router: Router, 
        private componentFactoryResolver: ComponentFactoryResolver
    ) {}

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode
    }

    onSubmit(form: NgForm) {
        if (!form.valid)
            return

        const email = form.value.email
        const password = form.value.password

        let authObservable: Observable<AuthResponseData>

        this.isLoading = true
        if (this.isLoginMode)
            authObservable = this.authService.login(email, password)
        else
            authObservable = this.authService.signup(email, password)

        authObservable.subscribe(resData => {
            console.log(resData)
            this.isLoading = false   
            
            this.router.navigate(['/recipes'])
        }, errorMessage=> {
            console.log(errorMessage)
            this.error = errorMessage
            this.showErrorAlert(errorMessage)
            this.isLoading = false                
        })

        form.reset()
    }

    onHandleError() {
        this.error = null
    }

    private showErrorAlert(message: string) {
        const alertCompFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent)
        const hostViewContainerRef = this.alertHost.viewContainerRef
        hostViewContainerRef.clear()

        const componentRef = hostViewContainerRef.createComponent(alertCompFactory)

        componentRef.instance.message = message
        this.closeSubscription = componentRef.instance.close.subscribe(() => {
            this.closeSubscription.unsubscribe()
            hostViewContainerRef.clear()
        })
    }

    ngOnDestroy(): void {
        if (this.closeSubscription)
            this.closeSubscription.unsubscribe()
    }
}