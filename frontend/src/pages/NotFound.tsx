

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900">
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-primary dark:text-white mb-4">404 - Not Found</h1>
                <p className="text-gray-600 dark:text-gray-400">The page you are looking for does not exist.</p>
            </div>
        </div>
    );
};

export default NotFound;
