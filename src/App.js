import { startTransition, useEffect, useState, useCallback, memo } from 'react';
import './App.css';
import FirebaseAuthService from './FirebaseAuthService';
import FirebaseFirestoreService from './FirebaseFirestoreService';
import LoginForm from './components/LoginForm';
import AddEditRecipeForm from './components/AddEditRecipeForm';

function App() {
  const [currentRecipe, setCurrentRecipe] = useState(null)
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [orderBy, setOrderBy] = useState('publishDateDesc');
  const [recipesPerPage, setRecipesPerPage] = useState(3)
  const fetchRecipes = useCallback(async (cursorId = '') => {
    const queries = [];
    if(categoryFilter) {
      queries.push({
        field: 'category',
        condition: '==',
        value: categoryFilter
      })
    }
    if(!user) {
      queries.push({
        field: 'isPublished',
        condition: '==',
        value: true
      })
    }

    const orderByField = 'publishDate';
    let orderByDirection;

    if(orderBy) {
      switch(orderBy) {
        case 'publishDateAsc':
          orderByDirection = 'asc';
          break;
        case 'publishDateDesc':
          orderByDirection = 'desc';
          break;
        default: break;
      }
    }
  
    let fetchedRecipes = [];

    try {
      const response = await FirebaseFirestoreService.readDocuments({
        collectionName: 'recipes',
        queries,
        orderByField: orderByField,
        orderByDirection: orderByDirection,
        perPage: recipesPerPage,
        cursorId: cursorId
      });

      const newRecipes = response.docs.map(recipeDoc => {
        const id = recipeDoc.id;
        const data = recipeDoc.data();
        data.publishDate = new Date(data.publishDate.seconds * 1000);
        return { ...data, id }
      })

      if(cursorId) {
        fetchedRecipes = [...recipes, ...newRecipes]
      } else {
        fetchedRecipes = [...newRecipes];
      }
    } catch(err) {
      console.log(err.message)
      throw err;
    }
    return fetchedRecipes;
  }, [orderBy, categoryFilter, user, recipes, recipesPerPage])

  useEffect(() => {
    FirebaseAuthService.subscribeToAuthChanges(setUser);
  }, [])

  useEffect(() => {
    setIsLoading(true);
    fetchRecipes()
      .then(fetchedRecipes => {
        setRecipes(fetchedRecipes);
      })
      .catch(err => {
        console.log(err.message)
        throw err
      })
      .finally(() => {
        setIsLoading(false);
      })
  }, [user, orderBy, fetchRecipes, recipesPerPage])

  function handleRecipePerPageChange(event) {
    const recipesPerPage = event.target.value;
    setRecipes([]);
    setRecipesPerPage(recipesPerPage);
  }

  function handleLoadMoreRecipesClick() {
    const lastRecipe = recipes[recipes.length - 1];
    const cursorId = lastRecipe.id;
    handleFetchRecipes(cursorId);
 
  }
  

  async function handleFetchRecipes(cursorId = '') {
    try {
      const recipes = await fetchRecipes();
      setRecipes(recipes);
    } catch(err) {
      console.log(err.message)
      throw err
    }
  }

  async function handleAddRecipe(newRecipe) {
    try {
      const respose = await FirebaseFirestoreService.createDocument('recipes', newRecipe);
      alert('successfully created recipe with ID = '+respose.id);
    } catch(err) {
      alert(err.message)
    }
  }

  function lookupCategoryLabel(categoryKey) {
    const categories = {
      breadsSandwichesAndPizza: 'Breads Sandwiches And Pizza',
      eggsAndBreakfast: 'Eggs And Breakfast',
      dessertsAndBakedGoods: 'Desserts And Baked Goods',
      fishAndSeafood: 'Fish And Seafood',
      vegatables: 'Vegetables'
    }

    const label = categories[categoryKey];
    return label;
  }

  function formatDate(date) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${month}-${day}-${year}`;
    return dateString
  }

  async function handleUpdateRecipe(newRecipe, recipeId) {
    try {
      await FirebaseFirestoreService.updateDocument(
        'recipes',
        recipeId,
        newRecipe
      )
      handleFetchRecipes();

      alert('successfully updated a recipe with an ID = ' + recipeId);
      setCurrentRecipe(null);
    } catch(err) {
      alert(err.message)
      throw err;
    }
  }

  function handleEditRecipeClick(recipeId) {
    const selectedRecipe = recipes.find(recipe => recipe.id === recipeId);
    if(selectedRecipe) {
      startTransition(() => {
        setCurrentRecipe(selectedRecipe)
      })
      window.scrollTo(0, document.body.scrollHeight)
    }
  }

  function handleEditRecipeCancel() {
    setCurrentRecipe(null);
  }

  async function handleDeleteRecipe(recipeId) {
    const deleteConfirmation = window.confirm(
      "Are you sure want to delete this recipe? OK for Yes. Cancel for No"
    );
    if(deleteConfirmation) {
      try {
        await FirebaseFirestoreService.deleteDocument('recipes', recipeId);
        handleFetchRecipes();
        setCurrentRecipe(null);
        window.scrollTo(0, 0);
        alert(`successfully deleted recipe with an ID = ${recipeId}`);
      } catch(err) {
        alert(err.message)
        throw err;
      }
    }
  }

  const handleChangeCatergoryFilter = (e) => {
    setCategoryFilter(e.target.value)
  }

  const FilterCategoryComponent = memo((categoryFilterProps) => (
    <label className="recipe-label input-label">
      Category:
      <select
        value={categoryFilterProps}
        onChange={(e) => {
          handleChangeCatergoryFilter(e);
        }}
        className='select'
        required
      >
        <option value=""></option>
        <option value="breadsSandwichesAndPizza">
          Breads Sandwiches And Pizza
        </option>
        <option value="eggsAndBreakfast">
          Eggs And Breakfast
        </option>
        <option value="dessertsAndBakedGoods">
          Desserts And Baked Goods
        </option>
        <option value="fishAndSeafood">
          Fish And Seafood
        </option>
        <option value="vegetables">Vegetables</option>
      </select>
    </label>
  ))

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase Recipes</h1>
        <LoginForm existingUser={user}></LoginForm>
      </div>
      <div className="main">
        <div className="row filters">
        <FilterCategoryComponent categoryFilterProps={categoryFilter} />
        <label className='input-label'>
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            className='select'
          >
            <option value="publishDateDesc">
              Publish Date (newest - oldest)
            </option>
            <option value="publishDateAsc">
              Publish Date (oldest - newest)
            </option>
          </select>
        </label>
        </div>
        <div className="center">
          <div className="recipe-list-box">
            {
              isLoading ? (
                <div className="fire">
                  <div className="flames">
                    <div className="flame"></div>
                    <div className="flame"></div>
                    <div className="flame"></div>
                    <div className="flame"></div>
                  </div>
                  <div className="logs"></div>
                </div>
              ) : null
            }
            {
              !isLoading && recipes && !recipes.length ? (
                <h5 className='no-recipes'>No Recipes Found</h5>
              ) : null
            }
            {
              recipes && recipes.length ? (
                <div className="recipe-list">
                  {
                    recipes.map(recipe => {
                      return (
                        <div className="recipe-card" key={recipe.id}>
                          {
                            recipe.isPublished === false ? (
                              <div className="unpublished">UNPUBLISHED</div>
                            ) : null
                          }
                          <div className="recipe-name">{recipe.name}</div>
                          <div className="recipe-field">Category: {lookupCategoryLabel(recipe.category)}</div>
                          <div className="recipe-field">Publish Date: {formatDate(recipe.publishDate)}</div>
                          {
                            user ? (
                              <button type='button' onClick={() => handleEditRecipeClick(recipe.id)} className='primary-button'>Edit</button>
                            )
                            : null
                          }
                        </div>
                      )
                    })
                  }
                </div>
              )
              : null
            }
          </div>
        </div>
      </div>
      {
        isLoading || (recipes && recipes.length > 0) ? 
        (
          <>
            <label className='input-label'>
              Recipes Per Page:
              <select
                value={recipesPerPage}
                onChange={handleRecipePerPageChange}
                className='select'
              >
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
              </select>
            </label>
            <div className='pagination'>
              <button type="button" className='primary-button' onClick={handleLoadMoreRecipesClick}>Load More Recipes</button>
            </div>
          </>
        ) : null
      }
      {
        user ? <AddEditRecipeForm
          existingRecipe={currentRecipe}
          handleAddRecipe={handleAddRecipe}
          handleUpdateRecipe={handleUpdateRecipe}
          handleDeleteRecipe={handleDeleteRecipe}
          handleEditRecipeCancel={handleEditRecipeCancel}
        ></AddEditRecipeForm>
        : null
      }
    </div>
  );
}

export default App;
