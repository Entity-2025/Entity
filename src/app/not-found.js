import Image from "next/image";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-[90vh] px-5">
            <Image priority src="/404.svg" alt="404 Not Found" width={800} height={600} />
            <div className="text-center mt-4">
                <h1 className="text-2xl">404</h1>
                <p className="text-2xl">?</p>
            </div>
        </div>
    );
}