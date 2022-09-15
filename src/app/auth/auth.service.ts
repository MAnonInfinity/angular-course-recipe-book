import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, Subject, tap, throwError } from "rxjs";
import { environment } from "src/environments/environment";

import { User } from "./user.model";

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean  // optional field
}

@Injectable({ providedIn: 'root' })

export class AuthService {
    user = new BehaviorSubject<User>(null)
    private tokenExpirationTimer: any

    private API_KEY = environment.firebaseAPIKey
    SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.API_KEY}`
    SIGNIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.API_KEY}`

    constructor (private http: HttpClient, private router: Router) {}

    private handleError(errorResponse: HttpErrorResponse) {
        let errMsg = 'An error occured!'

        if (!errorResponse.error || !errorResponse.error.error)
            return throwError(errMsg)

        switch(errorResponse.error.error.message) {
            case 'EMAIL_EXISTS':
                errMsg = 'This email already exists'
                break
            case 'EMAIL_NOT_FOUND':
                errMsg = "This email doesn't exist"
                break
            case 'INVALID_PASSWORD':
                errMsg = 'This password is incorrect'
                break
        }

        return throwError(errMsg)
    }

    private handleAuthentication(email: string, localId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(
            new Date().getTime() + +expiresIn*1000
        )
        const user = new User(
            email,
            localId, 
            token, 
            expirationDate
        )
        this.user.next(user)

        this.autoLogout(expiresIn * 1000)

        // persisting the credentials (token and all)
        localStorage.setItem('userData', JSON.stringify(user))
    }

    autoLogin() {
        const userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'))

        if (!userData)
            return

        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        )

        if (loadedUser.token) {
            this.user.next(loadedUser)

            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime()
            this.autoLogout(expirationDuration)
        }
    }

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(this.SIGNUP_URL, { 
            email, 
            password, 
            returnSecureToken: true 
        }).pipe(
            catchError(this.handleError), 
            tap(resData => {
                this.handleAuthentication(
                    resData.email, 
                    resData.localId, 
                    resData.idToken, 
                    +resData.expiresIn
                )
            })
        )
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(this.SIGNIN_URL, {
            email,
            password,
            returnSecureToken: true
        }).pipe(
            catchError(this.handleError),
            tap(resData => {
                this.handleAuthentication(
                    resData.email, 
                    resData.localId, 
                    resData.idToken, 
                    +resData.expiresIn
                )
            })
        )
    }

    logout() {
        this.user.next(null)
        this.router.navigate(['/auth'])

        localStorage.removeItem('userData')
        if (this.tokenExpirationTimer)
            clearTimeout(this.tokenExpirationTimer)
        this.tokenExpirationTimer = null
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout()
        }, expirationDuration)
    }
}