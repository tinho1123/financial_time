export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500">
                <span className="text-base leading-none">⏱</span>
            </div>
            <div className="grid flex-1 text-left text-sm">
                <span className="truncate font-bold leading-tight tracking-tight">
                    Financial<span className="text-emerald-500">Time</span>
                </span>
            </div>
        </div>
    );
}
