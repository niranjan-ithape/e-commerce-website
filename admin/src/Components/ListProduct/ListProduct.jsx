import React, { useEffect, useState } from 'react';
import "./ListProduct.css";
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  // Function to fetch product data from the server
  const fetchInfo = async () => {
    try {
      const res = await fetch('https://ecomback-rho.vercel.app/allproducts');
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error(error);
      // Optionally, you can show an error message to the user here
    }
  };

  // Fetch product data when the component mounts
  useEffect(() => {
    fetchInfo();
  }, []);

  // Function to remove a product
  const remove_product = async (id) => {
    try {
      const res = await fetch('https://ecomback-rho.vercel.app/removeproduct', {
        method: 'POST',
        headers: {
          'Accept': 'application/json', // Corrected to 'application/json'
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      if(res.ok){
        alert('Product removed successfully');
      }
      if (!res.ok) {
        throw new Error('Failed to remove product');
      }

      // Refetch products after removing one
      await fetchInfo();
    } catch (error) {
      console.error(error);
      // Optionally, you can show an error message to the user here
    }
  };

  return (
    <div className="list-product">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product) => (
          <div key={product.id} className="listproduct-format-main listproduct-format">
            <img src={product.image} alt={product.name} className="listproduct-product-icon" />
            <p>{product.name}</p>
            <p>${product.old_price.toFixed(2)}</p>
            <p>${product.new_price.toFixed(2)}</p>
            <p>{product.category}</p>
            <img 
              onClick={() => remove_product(product.id)} 
              src={cross_icon} 
              alt="Remove" 
              className="listproduct-remove-icon" 
            />
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
