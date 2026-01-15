export function Button(props) {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
    };

    const variant = variants[props.variant || 'primary'];
    const size = sizes[props.size || 'md'];

    return (
        <button
            class={`${baseClasses} ${variant} ${size} ${props.class || ''} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={props.onClick}
            type={props.type || 'button'}
            disabled={props.disabled}
        >
            {props.children}
        </button>
    );
}

export function Input(props) {
    return (
        <input
            class={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${props.class || ''}`}
            type={props.type || 'text'}
            placeholder={props.placeholder}
            value={props.value}
            onInput={(e) => props.onInput && props.onInput(e.target.value)}
            required={props.required}
        />
    );
}

export function Card(props) {
    return (
        <div class={`bg-white rounded-xl shadow-md p-6 ${props.class || ''}`}>
            {props.children}
        </div>
    );
}

export function Label(props) {
    return (
        <label class={`block text-sm font-medium text-gray-700 mb-1 ${props.class || ''}`}>
            {props.children}
        </label>
    );
}
