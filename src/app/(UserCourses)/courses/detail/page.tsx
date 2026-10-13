/* eslint-disable @typescript-eslint/no-unused-vars */
import CourseDetailClient from "./CourseDetailClient";

export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
    { id: "7" },
  ];
}

const CourseDetail = ({ params }: { params: { id: string } }) => {
  // console.log(params, 'params')
  return (
    <CourseDetailClient />
  );
};

export default CourseDetail;
