import React from "react";
import DragAndDrop from "./DragAndDrop";

const App = () => {
  const taskData = {
    Office_Task: [
      { id: "off_01", title: "Go to Office" },
      { id: "off_02", title: "Have Breakfast At office" },
      { id: "off_03", title: "Work At office" },
      { id: "off_04", title: "Go to Home" },
    ],
    Home_Task: [
      { id: "home_01", title: "Go To Home" },
      { id: "home_02", title: "Have Dinner" },
      { id: "home_03", title: "Go to sleep" },
      { id: "home_04", title: "Watch Tv" },
    ],
    Sunday_Task: [
      { id: "sun_01", title: "Sleep till late" },
      { id: "sun_02", title: "Have breakfast" },
      { id: "sun_03", title: "Go to Gym" },
      { id: "sun_04", title: "Go out" },
    ],
  };
  return <DragAndDrop data={taskData} />;
};

export default App;
