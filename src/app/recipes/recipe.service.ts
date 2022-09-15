import { EventEmitter, Injectable } from "@angular/core";

import { Ingredient } from "../shared/ingredient.model";
import { Recipe } from "./recipe.model";

import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Subject } from "rxjs";

@Injectable()
export class RecipeService {
    private recipes: Recipe[] = []
    // private recipes: Recipe[] = [
    //     new Recipe(
    //         'A test recipe', 
    //         'This is simply a test', 
    //         'https://www.vegrecipesofindia.com/wp-content/uploads/2018/06/murukku-recipe.jpg',
    //         [
    //             new Ingredient('besan', 1),
    //             new Ingredient('haldi', 1),
    //             new Ingredient('til', 100)
    //         ]
    //     ),
    //     new Recipe(
    //         'Another test recipe', 
    //         'This is simply another test', 
    //         'https://www.chefkunalkapur.com/wp-content/uploads/2021/06/Medu-Vada-1300x867.jpg?v=1623509746',
    //         [
    //             new Ingredient('udad', 2),
    //             new Ingredient('curd', 1),
    //             new Ingredient('oil', 2),
    //             new Ingredient('rava', 1)
    //         ]
    //     )
    // ]
    // public recipeSelected = new EventEmitter<Recipe>()
    recipesChanged = new Subject<Recipe[]>()

    constructor(private shoppingListService: ShoppingListService) {}

    setRecipes(recipes: Recipe[]) {
        this.recipes = recipes
        this.recipesChanged.next(this.recipes.slice())
    }

    getRecipes() {
        // to prevent returning the reference to the private recipes array
        return this.recipes.slice()
    }

    getRecipe(index: number) {
        return this.recipes[index]
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
        this.shoppingListService.addIngredients(ingredients)
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe)
        this.recipesChanged.next(this.recipes.slice())
    }

    updateRecipe(index: number, recipe: Recipe) {
        this.recipes[index] = recipe
        this.recipesChanged.next(this.recipes.slice())
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index, 1)
        this.recipesChanged.next(this.recipes.slice())
    }
}