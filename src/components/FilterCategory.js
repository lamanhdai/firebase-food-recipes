import { useState } from 'react';
function Category({categoryFilter, handleChangeCatergoryFilter}) {
  const [cat, setCat] = useState('publishDateDesc');
  return (
    <label className="recipe-label input-label">
          Category:
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
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
  )
}

export default Category