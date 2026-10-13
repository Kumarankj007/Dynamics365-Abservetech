/* eslint-disable @typescript-eslint/no-unused-vars */
import CoursePreviewClient from "./CoursePreview";

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

const CoursePreview = ({ params }: { params: { id: string } }) => {
  // console.log(params, 'params')
  return (
    <CoursePreviewClient />
  );
};

export default CoursePreview;
