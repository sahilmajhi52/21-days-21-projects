import React, { useEffect, useRef } from "react";
import { useState } from "react";

const DragAndDrop = ({ data: intialData }) => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("drag-item");
    if (savedData) {
      return JSON.parse(savedData);
    } else {
      return intialData;
    }
  });
  useEffect(() => {
    localStorage.setItem("drag-item", JSON.stringify(data));
  }, [data]);
  const mainHeadings = Object.keys(data); // ["Office_Task","Home_Task","Sunday_Task"]

  const dragItem = useRef(); // this will store all the information of item which is dragged
  const dragOverItem = useRef(); // this will store all the information of the destination item

  const handleDragStart = (e, idx, heading, taskObj) => {
    let dragElement = e.target;
    dragElement.style.opacity = 0.5;
    dragItem.current = {
      idx,
      heading,
      taskObj,
    };
  };
  const handleDragEnd = (e) => {
    let dragElement = e.target;
    dragElement.style.opacity = 1;
  };

  const handleDragEnter = (e, idx, heading) => {
    dragOverItem.current = {
      idx,
      heading,
    };
  };

  const handleDrop = () => {
    const sourceData = dragItem.current;
    const destinationData = dragOverItem.current;

    console.log(sourceData, destinationData);

    if (!sourceData || !destinationData) return null;

    setData((pre) => {
      //When the list is same
      if (sourceData.heading == destinationData.heading) {
        const list = [...pre[sourceData.heading]];
        const sourceIdx = sourceData.idx;
        const destinationIdx = destinationData.idx;
        const [removedItem] = list.splice(sourceIdx, 1);
        list.splice(destinationIdx, 0, removedItem);
        return {
          ...pre,
          [sourceData.heading]: list,
        };
      } else {
        //When the list is diffrent
        const sourceList = [...pre[sourceData.heading]];
        const destinationList = [...pre[destinationData.heading]];

        const sourceIdx = sourceData.idx;
        const destinationIdx = destinationData.idx;
        const [removedData] = sourceList.splice(sourceIdx, 1);
        destinationList.splice(destinationIdx ?? 0, 0, removedData);
        return {
          ...pre,
          [sourceData.heading]: sourceList,
          [destinationData.heading]: destinationList,
        };
      }
    });
  };
  return (
    <div style={style?.root}>
      {mainHeadings.map((heading) => {
        return (
          <div style={style?.container}>
            <p style={style?.heading} key={heading}>
              {heading.replace("_", " ")}
            </p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDragEnter={(e) => {
                if (data[heading].length === 0) {
                  console.log("onDragEnter");
                  handleDragEnter(e, 0, heading);
                }
              }}
              onDrop={handleDrop}
              style={style?.box}
            >
              {data[heading].map((taskObj, idx) => {
                return (
                  <div
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(e, idx, heading, taskObj);
                    }}
                    onDragEnter={(e) => {
                      handleDragEnter(e, idx, heading);
                    }}
                    onDragEnd={(e) => {
                      handleDragEnd(e);
                    }}
                    style={style?.taskContainer}
                    key={taskObj.id}
                  >
                    {taskObj.title}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DragAndDrop;

const style = {
  root: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  container: {
    width: "25%",
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "column",
  },
  box: {
    minHeight: "70px",
    width: "100%",
    paddingLeft: "10px",
    paddingRight: "10px",
    backgroundColor: "#F5FBE6",
    borderRadius: 6,
    border: "1px solid #215E61",
  },
  heading: {
    fontSize: "1.2rem",
    fontWeight: 700,
  },
  taskContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,

    padding: "15px",
    margin: "10px",
    backgroundColor: "#FE7F2D",
    color: "white",
  },
};
