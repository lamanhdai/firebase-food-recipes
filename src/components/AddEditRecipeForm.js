import { useEffect, useState } from 'react';
function AddRecipeForm({
  existingRecipe,
  handleAddRecipe,
  handleUpdateRecipe,
  handleEditRecipeCancel,
  handleDeleteRecipe
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [directions, setDirections] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [ingredientName, setIngredientName] = useState('');

  useEffect(() => {
    if(existingRecipe) {
      setName(existingRecipe.name);
      setCategory(existingRecipe.category);
      setDirections(existingRecipe.directions);
      setPublishDate(existingRecipe.publishDate.toISOString().split('T')[0]);
      setIngredients(existingRecipe.ingredients);
    } else {
      resetForm();
    }
  }, [existingRecipe])
  function handleAddIngredient(e) {
    if(e.key && e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    if(!ingredientName) {
      alert('Missing ingredient field. Please double check.')
      return;
    }

    setIngredients([...ingredients, ingredientName]);
    setIngredientName('');
  }

  function handleRecipeFormSubmit(e) {
    e.preventDefault();

    if(ingredients.length === 0) {
      alert('ingredients cannot be empty. Please add at least 1 ingredient');
      return;
    }

    const isPublished = new Date(publishDate) <= new Date() ? false : true;

    const newRecipe = {
      name,
      category,
      directions,
      publishDate: new Date(publishDate),
      isPublished,
      ingredients
    }

    if(existingRecipe) {
      handleUpdateRecipe(newRecipe, existingRecipe.id);
    } else {
      handleAddRecipe(newRecipe);
    }
    resetForm();
  }

  function resetForm() {
    setName('');
    setCategory('');
    setDirections('');
    setPublishDate('');
    setIngredients([]);
  }

  return <form onSubmit={handleRecipeFormSubmit} className='add-edit-recipe-form-container'>
    { existingRecipe ? <h2>Edit a new recipe</h2> : <h2>Add a new recipe</h2> }
    <div className="top-form-section">
      <div className="fields">
        <label className="recipe-label input-label">
          Recipe Name:
          <input type="text" required value={name} className="input-text" onChange={e => setName(e.target.value)} />
        </label>
        <label className="recipe-label input-label">
          Category:
          <select value={category} onChange={e => setCategory(e.target.value)} className='select' required>
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
        <label>
          Directions:
          <textarea
            required
            value={directions}
            onChange={e => setDirections(e.target.value)}
            className='input-text directions'
          ></textarea>
        </label>
        <label>
          Published Date:
          <input
            type="date"
            value={publishDate}
            required
            onChange={e => setPublishDate(e.target.value)}
            className='input-text'
          />
        </label>
      </div>
    </div>
    <div className='ingredients-list'>
      <h3 className='text-center'>Ingredients</h3>
      <table className='ingredients-table'>
        <thead>
          <tr>
            <th className="table-header">Ingredient</th>
            <th className="table-header">Delete</th>
          </tr>
        </thead>
        <tbody>
          {
            ingredients && ingredients.length > 0 ? ingredients.map((ingredient) => (
              <tr key={ingredient}>
                <td className="table-data text-center">{ingredient}</td>
                <td className="ingredient-delete-box">
                  <button className="secondary-button ingredient-delete-button" type='button'>
                    Delete
                  </button>
                </td>
              </tr>
            ))
            : null
          }
        </tbody>
      </table>
      {
        ingredients && ingredients.length === 0 ? <h3 className='text-center no-ingredients'>
          No Ingredients Added Yet
        </h3> : null
      }
      <div className="ingredient-form">
        <label className='ingrdient-label'>
          Ingredient:
          <input type="text"
            value={ingredientName}
            onChange={e => setIngredientName(e.target.value)}
            onKeyPress={handleAddIngredient}
            className='input-text'
            placeholder='ex. 1 cup of sugar'
          />
        </label>
        <button
          type='button'
          className='primary-button add-ingredient-button'
          onClick={handleAddIngredient}
        >Add Ingredient</button>
      </div>
    </div>
    <div className='action-buttons'>
      <button
        type='submit'
        className='primary-button action-button'
      >{ existingRecipe ? 'Update Recipe' : 'Create Recipe' }</button>
      {
        existingRecipe ? (
          <>
            <button type='button' onClick={handleEditRecipeCancel} className='primary-button action-button'>Cancel</button>
            <button type='button' onClick={() => handleDeleteRecipe(existingRecipe.id)} className='primary-button action-button'>Delete</button>
          </>
        ) : null
      }
    </div>
  </form>
}

export default AddRecipeForm;