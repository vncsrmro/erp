import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <LoadingAnimation size="lg" />
        </div>
    );
}
