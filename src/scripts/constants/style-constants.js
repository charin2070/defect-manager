export const COMMON_CLASSES = {
    NO_SELECT: 'no-cursor-select',
    CONTAINER: 'min-h-screen bg-gray-100',
    NAVBAR: {
        WRAPPER: 'navbar fixed top-0 left-0 w-full bg-white shadow-sm border-b border-gray-200 z-50',
        CONTAINER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        CONTENT: 'flex justify-between h-16',
        SECTION: {
            LEFT: 'flex items-center',
            RIGHT: 'flex items-center space-x-4'
        }
    },
    DROPDOWN: {
        CONTAINER: 'ml-6 relative',
        BUTTON: 'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        CONTENT: 'hidden origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none'
    }
};
