import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { exhaustMap, map, take, tap } from "rxjs";

import { Recipe } from "../recipes/recipe.model";

import { RecipeService } from "../recipes/recipe.service";
import { AuthService } from "../auth/auth.service";

@Injectable({ providedIn: 'root' })

export class DataStorageService {
    URL: string = 'https://angular-course-recipe-bo-744e0-default-rtdb.firebaseio.com'

    constructor(
        private http: HttpClient, 
        private recipeService: RecipeService,
        private authService: AuthService
    ) {}

    storeRecipes() {
        const recipes = this.recipeService.getRecipes()
        this.http.put(this.URL + '/recipes.json', recipes)
            .subscribe(res => {
                console.log(res)                
            })
    }

    fetchRecipes() {
        return this.http.get<Recipe[]>(
            this.URL + '/recipes.json'
        ).pipe(
            map(recipes => {  // rxjs map fxn
                return recipes.map(recipe => {  // standard js map fxn
                    return {...recipe, ingredients: recipe.ingredients? recipe.ingredients : []}
                })
            }),
            tap(recipes => {
                this.recipeService.setRecipes(recipes)
            })
        )  
    }
}