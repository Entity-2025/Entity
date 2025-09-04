export default async function AboutPage() {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">Ok!</h1>
        </div>
    );
}
