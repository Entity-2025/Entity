import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center h-[90vh] p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div className="flex flex-col sm:flex-row items-center sm:items-end">
                    <Link href="/login">
                        <Image
                            style={{ width: 200, height: 200 }}
                            className="invert dark:invert-0 animate-pulse"
                            src="/entity.svg"
                            alt="Entity logo"
                            width={180}
                            height={38}
                            priority
                        />
                    </Link>

                </div>
                <div className="flex gap-4 items-center flex-col sm:flex-row">
                </div>
            </main>
        </div>
    );
}
