import CourseContentViewClient from "./CourseContentView";

// export async function generateStaticParams() {
//   return [
//     { id: "1" },
//     { id: "2" },
//     { id: "3" },
//     { id: "4" },
//     { id: "5" },
//     { id: "6" },
//     { id: "7" },
//   ];
// }

const Outline = () => {
  // console.log(params, 'params')
  return (
    <CourseContentViewClient courseId={"1"} />
  );
};

export default Outline;
