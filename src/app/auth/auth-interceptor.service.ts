import { HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { exhaustMap, take } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()

export class AuthInterceptorService implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return this.authService.user.pipe(
            // take only one value (first value) from the observable and then unsubscribe automatically
            take(1), 
            // exhaustMap : execute the first observable, then the second observable catches the value returned by the 
            // first observable, then execute the second observable 
            exhaustMap(user => {
                if (!user)
                    return next.handle(req)

                const modifiedReq = req.clone({
                    params: new HttpParams().set('auth', user.token)
                })
                return next.handle(modifiedReq)
            })
        )
    }
}