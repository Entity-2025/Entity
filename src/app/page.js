import Link from "next/link";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";

export default function Home() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center h-[90vh] p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div className="flex flex-col sm:flex-row items-center sm:items-end">
                    <Link href="/login">
                        <EntityButtonLoading className="invert-0 w-22 h-22 animate-pulse" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
