import CoursePlayerClient from "./coursePlayer";

export async function generateStaticParams() {
  // Example: fetch IDs from your DB or hardcode for testing
  const courseIds = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
  ];
  const lessonIds = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
  ];

  // Return all possible combos
  return courseIds.flatMap((id) =>
    lessonIds.map((lessonId) => ({
      id,
      lessonId,
    }))
  );
}
interface PageProps {
  params: { id: string; lessonId: string };
}

export default function CoursePlayer({ params }: PageProps) {
  // console.log(params, 'params')
  return <CoursePlayerClient />;
}

// export default CoursePlayer;
