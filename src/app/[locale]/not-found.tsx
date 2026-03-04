import { ErrorState } from '@/components/shared/ErrorState'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center">
            <ErrorState
                title="404 - Page Not Found"
                message="The page you're looking for doesn't exist. NOVA might have moved it, or it was never there in the first place."
            />
        </div>
    )
}
