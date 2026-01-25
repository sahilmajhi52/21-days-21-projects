import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setRestaurantData } from "./Store/appSlice";

export function useGetRestaurantDetails() {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const restaurantData = useSelector((store) => store.app.restaurantData);
  async function getData() {
    if (restaurantData.length !== 0) {
      setData(restaurantData);
      return;
    }
    console.log("Api called");
    let data = await fetch(
      `https://mocki.io/v1/b0ed27cf-5681-4804-beaa-f5bb7044a3e6`
    );
    let jsonData = await data.json();
    setData(jsonData.restaurants);
    dispatch(setRestaurantData(jsonData.restaurants));
  }
  useEffect(() => {
    getData();
  }, []);
  return data;
}
