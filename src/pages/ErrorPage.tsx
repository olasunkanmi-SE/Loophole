interface ErrorPageProps {
  title: string;
  message: string;
}

export default function ErrorPage({ title, message }: ErrorPageProps) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  );
}
