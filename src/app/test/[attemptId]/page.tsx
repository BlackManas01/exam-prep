import ExamInterface from "@/components/ExamInterface";

export default async function TestPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <ExamInterface attemptId={attemptId} />;
}
